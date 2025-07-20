import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { requirement, jiraConfig } = await request.json();

    if (!requirement || !jiraConfig) {
      return NextResponse.json({ error: 'Missing requirement or Jira config' }, { status: 400 });
    }

    const { url, token, projectKey } = jiraConfig;

    // Create Jira issue
    const issueData = {
      fields: {
        project: { key: projectKey },
        summary: requirement.title,
        description: requirement.description,
        issuetype: { name: 'Story' },
        priority: { name: requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1) },
        labels: [requirement.category, requirement.type],
        customfield_10000: requirement.acceptance_criteria.join('\n') // Assuming this is acceptance criteria field
      }
    };

    const response = await fetch(`${url}/rest/api/2/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(issueData)
    });

    if (response.ok) {
      const issue = await response.json();
      return NextResponse.json({ 
        success: true, 
        issueKey: issue.key,
        issueUrl: `${url}/browse/${issue.key}`,
        message: 'Jira issue created successfully' 
      });
    } else {
      const error = await response.json();
      return NextResponse.json({ 
        success: false, 
        message: `Failed to create Jira issue: ${error.errors}` 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create Jira issue' 
    }, { status: 500 });
  }
}