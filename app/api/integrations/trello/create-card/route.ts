import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { requirement, trelloConfig } = await request.json();

    if (!requirement || !trelloConfig) {
      return NextResponse.json({ error: 'Missing requirement or Trello config' }, { status: 400 });
    }

    const { token, listId } = trelloConfig;
    const apiKey = process.env.TRELLO_API_KEY;

    // Create Trello card
    const cardData = {
      name: requirement.title,
      desc: `${requirement.description}\n\n**Type:** ${requirement.type}\n**Priority:** ${requirement.priority}\n**Category:** ${requirement.category}\n\n**Acceptance Criteria:**\n${requirement.acceptance_criteria.map(c => `- ${c}`).join('\n')}`,
      idList: listId,
      key: apiKey,
      token: token
    };

    const params = new URLSearchParams(cardData);
    const response = await fetch(`https://api.trello.com/1/cards?${params}`, {
      method: 'POST'
    });

    if (response.ok) {
      const card = await response.json();
      return NextResponse.json({ 
        success: true, 
        cardId: card.id,
        cardUrl: card.shortUrl,
        message: 'Trello card created successfully' 
      });
    } else {
      const error = await response.json();
      return NextResponse.json({ 
        success: false, 
        message: `Failed to create Trello card: ${error.message}` 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create Trello card' 
    }, { status: 500 });
  }
}