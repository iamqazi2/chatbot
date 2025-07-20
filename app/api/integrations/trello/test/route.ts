import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Test Trello connection
    const response = await fetch(`https://api.trello.com/1/members/me?key=${process.env.TRELLO_API_KEY}&token=${token}`, {
      method: 'GET'
    });

    if (response.ok) {
      const user = await response.json();
      return NextResponse.json({ 
        success: true, 
        user: user.fullName,
        message: 'Trello connection successful' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Trello' 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Connection test failed' 
    }, { status: 500 });
  }
}