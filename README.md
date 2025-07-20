# AI-Powered Agile Requirements Chatbot

A comprehensive solution for Agile software requirements elicitation using Next.js, the Grok API, and intelligent conversation processing.

## Features

### Core Functionality
- **Intelligent Conversation**: AI-powered chatbot that understands context and asks clarifying questions
- **Real-time Requirement Capture**: Automatically extracts and categorizes requirements from natural conversations
- **Structured Documentation**: Organizes requirements with acceptance criteria, priorities, and dependencies
- **Agile Integration**: Direct export to Jira and Trello for seamless workflow integration

### Technical Capabilities
- **Grok API Integration**: Leverages xAI's Grok API for advanced natural language processing
- **Fallback System**: Rule-based processing when API is unavailable
- **Responsive Design**: Works across all devices with modern, accessible UI
- **Real-time Updates**: Smooth, interactive chat experience with typing indicators

### Requirements Management
- **Functional & Non-functional**: Automatically categorizes requirement types
- **Priority Assessment**: Intelligent priority assignment based on conversation context
- **Acceptance Criteria**: Auto-generated testable criteria for each requirement
- **Dependency Tracking**: Identifies and tracks requirement dependencies

## Quick Start

### Prerequisites
- Node.js 18+ 
- Grok API key from [x.ai/api](https://x.ai/api)
- Optional: Jira/Trello API credentials for integration

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd agile-requirements-chatbot
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your API keys:
   ```env
   GROK_API_KEY=your_grok_api_key_here
   TRELLO_API_KEY=your_trello_api_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Starting a Requirements Session

1. **Initiate Conversation**: The chatbot will greet you and ask about your project
2. **Describe Your Needs**: Explain your software requirements in natural language
3. **Engage with Follow-ups**: Answer clarifying questions to refine requirements
4. **Review Captured Requirements**: Monitor the requirements panel for extracted items

### Example Conversation Flow

```
User: "I need a user authentication system for my web application"

Bot: "I've captured a functional requirement for user authentication. Could you specify:
- What authentication methods should be supported? (email/password, social login, etc.)
- Are there any specific security requirements?
- Do you need features like password reset or account verification?"

User: "Users should be able to register with email and password, and I need password reset functionality"

Bot: "Perfect! I've updated the requirement with registration and password reset features. 
What about security requirements? For example:
- Password complexity requirements?
- Account lockout after failed attempts?
- Two-factor authentication?"
```

### Requirement Export Options

**Export to JSON**
- Click "Export" in the requirements panel
- Downloads comprehensive JSON with all requirements and conversation history

**Export to Jira**
- Configure Jira credentials in Settings
- Click the Jira export button on individual requirements
- Creates user stories with acceptance criteria

**Export to Trello**
- Configure Trello credentials in Settings
- Click the Trello export button on individual requirements
- Creates cards with detailed descriptions

## Architecture

### Frontend Components
- **Main Chat Interface**: Real-time conversation with AI assistant
- **Requirements Panel**: Live requirement capture and management
- **Settings Panel**: API configuration and integration setup
- **Export Tools**: Multiple export formats for different workflows

### Backend API Routes
- **`/api/chat`**: Core conversation processing with Grok API
- **`/api/health`**: API connectivity status checking
- **`/api/integrations/jira`**: Jira integration endpoints
- **`/api/integrations/trello`**: Trello integration endpoints

### Key Technologies
- **Next.js 13+**: Full-stack React framework with App Router
- **Tailwind CSS**: Utility-first styling for responsive design
- **shadcn/ui**: Modern component library for consistent UI
- **Grok API**: Advanced NLP for intelligent conversation
- **TypeScript**: Type-safe development environment

## Configuration

### API Configuration
```typescript
// Environment variables
GROK_API_KEY=your_grok_api_key_here
TRELLO_API_KEY=your_trello_api_key_here

// Optional integrations
JIRA_URL=https://yourcompany.atlassian.net
JIRA_TOKEN=your_jira_api_token
```

### Customization Options
- **Requirement Categories**: Customize in Settings panel
- **Context Window**: Adjust conversation memory (5-20 messages)
- **Auto-capture**: Toggle automatic requirement extraction
- **Priority Keywords**: Modify priority detection rules

## Integration Guide

### Jira Integration
1. **Generate API Token**: Go to Jira Account Settings → Security → API tokens
2. **Configure in Settings**: Add Jira URL and API token
3. **Test Connection**: Use the "Test Connection" button
4. **Export Requirements**: Click Jira export button on requirements

### Trello Integration
1. **Get API Credentials**: Visit [Trello Developer Portal](https://trello.com/app-key)
2. **Configure in Settings**: Add Trello API key and token
3. **Test Connection**: Use the "Test Connection" button
4. **Export Requirements**: Click Trello export button on requirements

## Deployment

### Netlify (Recommended)
```bash
npm run build
# Deploy dist folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
GROK_API_KEY=your_production_grok_key
TRELLO_API_KEY=your_production_trello_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_secret
```

## Error Handling

### Fallback Mechanisms
- **API Unavailable**: Automatic fallback to rule-based processing
- **Network Issues**: Graceful degradation with error messages
- **Invalid Responses**: Parsing error recovery with user feedback

### Monitoring
- **API Status**: Real-time connection monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time and success rate tracking

## Best Practices

### Requirements Gathering
- **Start Broad**: Begin with high-level project goals
- **Drill Down**: Ask specific questions for each requirement
- **Validate Understanding**: Confirm requirements with stakeholders
- **Iterate**: Use Agile principles for continuous refinement

### Conversation Tips
- **Be Specific**: Provide concrete examples and scenarios
- **Consider Edge Cases**: Discuss error conditions and exceptions
- **Think User-Centric**: Focus on user value and experience
- **Document Assumptions**: Capture any underlying assumptions

## Contributing

### Development Setup
```bash
git clone <repository-url>
cd agile-requirements-chatbot
npm install
npm run dev
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Conventional Commits**: Semantic commit messages

### Testing
```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Support

### Getting Help
- **Documentation**: Comprehensive guides and API reference
- **GitHub Issues**: Bug reports and feature requests
- **Community**: Discussion forums and chat support

### Troubleshooting
- **API Connection Issues**: Check API keys and network connectivity
- **Integration Problems**: Verify third-party service credentials
- **Performance Issues**: Monitor API usage and rate limits

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release with core chatbot functionality
- Grok API integration for intelligent conversation
- Basic requirement extraction and categorization
- Jira and Trello integration
- Responsive web interface

### Roadmap
- [ ] Advanced requirement templates
- [ ] Multi-language support
- [ ] Voice input capability
- [ ] Advanced analytics dashboard
- [ ] Custom integration webhooks
- [ ] Collaborative requirement review