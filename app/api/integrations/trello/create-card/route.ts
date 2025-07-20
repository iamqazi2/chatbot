import { NextRequest, NextResponse } from "next/server";

// Define interfaces for the expected request body
interface TrelloConfig {
  token: string;
  listId: string;
}

interface Requirement {
  title: string;
  description: string;
  type: string;
  priority: string;
  category: string;
  acceptance_criteria: string[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      requirement,
      trelloConfig,
    }: { requirement: Requirement; trelloConfig: TrelloConfig } =
      await request.json();

    // Validate required fields
    if (!requirement || !trelloConfig) {
      return NextResponse.json(
        { error: "Missing requirement or Trello config" },
        { status: 400 }
      );
    }

    const { token, listId } = trelloConfig;
    const apiKey = process.env.TRELLO_API_KEY;

    // Ensure apiKey is defined
    if (!apiKey) {
      return NextResponse.json(
        { error: "Trello API key is not configured" },
        { status: 500 }
      );
    }

    // Create Trello card data
    const cardData: Record<string, string> = {
      name: requirement.title,
      desc: `${requirement.description}\n\n**Type:** ${
        requirement.type
      }\n**Priority:** ${requirement.priority}\n**Category:** ${
        requirement.category
      }\n\n**Acceptance Criteria:**\n${requirement.acceptance_criteria
        .map((c: string) => `- ${c}`)
        .join("\n")}`,
      idList: listId,
      key: apiKey,
      token: token,
    };

    const params = new URLSearchParams(cardData);
    const response = await fetch(`https://api.trello.com/1/cards?${params}`, {
      method: "POST",
    });

    if (response.ok) {
      const card = await response.json();
      return NextResponse.json({
        success: true,
        cardId: card.id,
        cardUrl: card.shortUrl,
        message: "Trello card created successfully",
      });
    } else {
      const error = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create Trello card: ${
            error.message || "Unknown error"
          }`,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Trello card",
      },
      { status: 500 }
    );
  }
}
