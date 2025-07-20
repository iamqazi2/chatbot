import { NextRequest, NextResponse } from "next/server";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "requirement" | "clarification" | "general";
}

interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  type: "functional" | "non-functional";
  priority: "high" | "medium" | "low";
  category: string;
  acceptance_criteria: string[];
  estimated_effort: string;
  dependencies: string[];
}

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function POST(request: NextRequest) {
  let message: string | undefined;
  let conversationHistory: Message[] | undefined;

  try {
    console.log("=== Chat API called ===");

    // Basic request validation
    if (!request.body) {
      console.error("No request body provided");
      return NextResponse.json(
        {
          error: "No request body provided",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    message = body.message;
    conversationHistory = body.conversationHistory;

    if (!message) {
      console.error("No message provided in request");
      return NextResponse.json(
        {
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    console.log("Received message:", message);
    console.log("API Key available:", !!process.env.GEMINI_API_KEY);

    // Try to use Gemini API first
    let response = await callGeminiAPI(message, conversationHistory ?? []);

    if (!response) {
      console.log("Gemini API failed, using fallback");
      // Fallback to rule-based processing
      response = await fallbackProcessing(message, conversationHistory ?? []);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return fallback response with proper error status
    try {
      const fallbackResponse = await fallbackProcessing(
        typeof message === "string" ? message : "Hello",
        conversationHistory || []
      );
      return NextResponse.json(fallbackResponse);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return NextResponse.json(
        {
          response:
            "I apologize, but I'm having trouble processing your request right now. Could you please rephrase your requirement or provide more specific details?",
          type: "general",
          requirements: [],
          status: "error",
        },
        { status: 200 }
      ); // Return 200 to prevent frontend error
    }
  }
}

async function callGeminiAPI(message: string, conversationHistory: Message[]) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  console.log("Attempting Gemini API call...");
  console.log("API Key exists:", !!GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.log("No Gemini API key found");
    return null;
  }

  try {
    const context = conversationHistory
      .slice(-5)
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join("\n");

    const systemPrompt = `You are an expert Agile requirements analyst helping stakeholders capture software requirements through conversation.

Previous conversation context:
${context}

Current user message: ${message}

Your role:
1. Engage in natural conversation to understand requirements
2. Ask clarifying questions when requirements are vague
3. Extract clear requirements and categorize them
4. Provide helpful guidance on requirement specification

Please respond conversationally and naturally. If you identify any requirements, also extract them.

For any requirements you identify, categorize them as:
- Type: functional or non-functional
- Priority: high, medium, or low  
- Category: Authentication, User Management, Data Processing, API Integration, Security, Performance, UI/UX, Reporting, or General

Respond in a helpful, professional tone as if you're a business analyst working with a stakeholder.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40,
        },
      }),
    });

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Could not read error response";
      }
      console.error("Gemini API error:", response.status, errorText);
      return {
        response: `Gemini API error: ${response.status} - ${errorText}`,
        type: "general",
        requirements: [],
        status: "error",
      };
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse Gemini API response as JSON:", e);
      return {
        response: "Failed to parse Gemini API response.",
        type: "general",
        requirements: [],
        status: "error",
      };
    }

    console.log("Gemini API response data:", JSON.stringify(data, null, 2));

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0].text
    ) {
      console.error("Invalid Gemini API response structure:", data);
      return {
        response: "Gemini API returned an unexpected response format.",
        type: "general",
        requirements: [],
        status: "error",
      };
    }

    const botResponse = data.candidates[0].content.parts[0].text;

    // Extract requirements from the response using simple keyword detection
    const requirements = extractRequirementsFromText(message, botResponse);

    // Determine response type based on content
    let responseType: "requirement" | "clarification" | "general" = "general";
    if (requirements.length > 0) {
      responseType = "requirement";
    } else if (
      botResponse.includes("?") ||
      botResponse.toLowerCase().includes("clarify") ||
      botResponse.toLowerCase().includes("could you")
    ) {
      responseType = "clarification";
    }

    return {
      response: botResponse,
      type: responseType,
      requirements: requirements,
      status: "success",
    };
  } catch (error) {
    console.error("Gemini API call error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      response: "Gemini API call failed.",
      type: "general",
      requirements: [],
      status: "error",
    };
  }
}

function extractRequirementsFromText(
  userMessage: string,
  botResponse: string
): ExtractedRequirement[] {
  const requirements: ExtractedRequirement[] = [];
  const lowerMessage = userMessage.toLowerCase();

  // Keywords that indicate functional requirements
  const functionalKeywords = [
    "user can",
    "user should",
    "system should",
    "application must",
    "feature",
    "functionality",
    "login",
    "register",
    "create",
    "update",
    "delete",
    "search",
    "filter",
    "navigate",
    "display",
    "show",
    "hide",
    "submit",
    "validate",
    "authenticate",
  ];

  // Keywords that indicate non-functional requirements
  const nonFunctionalKeywords = [
    "performance",
    "security",
    "usability",
    "scalability",
    "reliability",
    "availability",
    "maintainability",
    "response time",
    "load time",
    "concurrent users",
    "uptime",
    "backup",
    "fast",
    "secure",
  ];

  // Check if the message contains requirement indicators
  const hasFunctional = functionalKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  const hasNonFunctional = nonFunctionalKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (hasFunctional || hasNonFunctional) {
    const requirementId = `req_${Date.now()}`;

    // Determine category based on keywords
    let category = "General";
    if (
      lowerMessage.includes("login") ||
      lowerMessage.includes("auth") ||
      lowerMessage.includes("register")
    ) {
      category = "Authentication";
    } else if (
      lowerMessage.includes("user") ||
      lowerMessage.includes("profile")
    ) {
      category = "User Management";
    } else if (
      lowerMessage.includes("data") ||
      lowerMessage.includes("process")
    ) {
      category = "Data Processing";
    } else if (
      lowerMessage.includes("api") ||
      lowerMessage.includes("integration")
    ) {
      category = "API Integration";
    } else if (
      lowerMessage.includes("security") ||
      lowerMessage.includes("secure")
    ) {
      category = "Security";
    } else if (
      lowerMessage.includes("performance") ||
      lowerMessage.includes("fast")
    ) {
      category = "Performance";
    } else if (
      lowerMessage.includes("interface") ||
      lowerMessage.includes("ui") ||
      lowerMessage.includes("design")
    ) {
      category = "UI/UX";
    } else if (
      lowerMessage.includes("report") ||
      lowerMessage.includes("analytics")
    ) {
      category = "Reporting";
    }

    // Determine priority
    let priority: "high" | "medium" | "low" = "medium";
    if (
      lowerMessage.includes("critical") ||
      lowerMessage.includes("must") ||
      lowerMessage.includes("essential")
    ) {
      priority = "high";
    } else if (
      lowerMessage.includes("nice to have") ||
      lowerMessage.includes("optional")
    ) {
      priority = "low";
    }

    // Generate title
    const words = userMessage.trim().split(" ");
    const title = words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");

    // Generate acceptance criteria
    const acceptanceCriteria = hasFunctional
      ? [
          "Feature behaves as described",
          "User interface is intuitive and accessible",
          "All edge cases are handled appropriately",
        ]
      : [
          "Performance meets specified requirements",
          "Quality attributes are measurable and testable",
          "System maintains stability under expected load",
        ];

    const requirement: ExtractedRequirement = {
      id: requirementId,
      title: title,
      description: userMessage,
      type: hasFunctional ? "functional" : "non-functional",
      priority: priority,
      category: category,
      acceptance_criteria: acceptanceCriteria,
      estimated_effort: "TBD",
      dependencies: [],
    };

    requirements.push(requirement);
  }

  return requirements;
}

async function fallbackProcessing(
  message: string,
  conversationHistory: Message[]
) {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based requirement extraction
  const requirements: ExtractedRequirement[] = extractRequirementsFromText(
    message,
    ""
  );

  let responseType: "requirement" | "clarification" | "general" = "general";
  let response = "";

  // Generate contextual responses based on message content
  if (requirements.length > 0) {
    responseType = "requirement";
    const reqType = requirements[0].type;

    if (reqType === "functional") {
      response = `I've captured a functional requirement about ${requirements[0].category.toLowerCase()}. To better understand this requirement, could you provide more details about:

• The specific user actions or workflows involved
• Any business rules or validation requirements  
• Expected system behavior in different scenarios
• Integration points with other systems or features

This will help me create more detailed acceptance criteria and identify any dependencies.`;
    } else {
      response = `I've noted a non-functional requirement related to ${requirements[0].category.toLowerCase()}. To properly specify this requirement, could you help me understand:

• Specific performance targets or thresholds
• Measurement criteria and testing approaches
• Expected load conditions or usage patterns
• Any compliance or regulatory considerations

This information will help ensure the requirement is testable and achievable.`;
    }
  } else if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("start")
  ) {
    response = `Hello! I'm here to help you capture and refine your software requirements. Let's start by discussing your project goals. 

Could you tell me:
• What type of software or system are you planning to develop?
• Who are the main users or stakeholders?
• What are the primary business objectives you want to achieve?

Feel free to describe your needs in your own words - I'll help organize them into clear, actionable requirements.`;
  } else if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
    response = `I can help you capture and organize software requirements through our conversation. Here's how we can work together:

**What I can do:**
• Extract functional and non-functional requirements from your descriptions
• Ask clarifying questions to refine vague or incomplete requirements
• Categorize requirements by type and priority
• Generate acceptance criteria and identify dependencies
• Export requirements to Jira or Trello for your development team

**How to get started:**
Simply describe what you need your software to do, who will use it, and what problems it should solve. I'll guide you through the details!

What aspect of your project would you like to discuss first?`;
  } else {
    // Generate clarifying questions based on context
    const clarifyingQuestions = [
      `I'd like to understand your requirements better. Could you describe the main functionality you need in more detail?`,

      `To help capture your requirements effectively, could you tell me more about:
• The specific user roles or personas involved
• The key workflows or processes you want to support
• Any constraints or limitations I should be aware of`,

      `Let's break this down further. What are the most critical features for your first release? We can prioritize requirements based on business value and user needs.`,

      `I want to make sure I understand correctly. Could you walk me through a typical user scenario or use case? This will help me identify the detailed requirements.`,

      `To provide better guidance, it would help to know:
• What platforms or technologies you're considering
• Any integration requirements with existing systems
• Performance or scalability expectations`,
    ];

    responseType = "clarification";
    response =
      clarifyingQuestions[
        Math.floor(Math.random() * clarifyingQuestions.length)
      ];
  }

  return {
    response,
    type: responseType,
    requirements,
    status: "fallback",
  };
}
