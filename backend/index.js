const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Groq Setup ───
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Platform Instructions ───
const PLATFORM_INSTRUCTIONS = {
  linkedin: `Write a LinkedIn post. Use line breaks, numbered lists if needed, and end with a question or CTA. Max ~280 words. Professional-yet-personal tone.`,
  x: `Write a Twitter/X thread. Start with a punchy hook tweet. Add 3-4 follow-up tweets numbered "2/", "3/" etc. Keep each tweet under 280 chars. End with engagement hook.`,
  instagram: `Write an Instagram caption. Start with a hook line. Keep it emotionally resonant. Add line breaks for readability. End with a CTA like "Save this" or "Tag someone". Add dots (.) for spacing before hashtags section.`,
};

// ─── Prompt Builder ───
function buildPrompt({ brand, userPrompt, platform, goal, tone, addEmojis, addHashtags }) {
  const brandContext = brand
    ? `
BRAND CONTEXT (use this to match the brand voice):
- Company: ${brand.company_name || 'Not specified'}
- Industry: ${brand.industry || 'Not specified'}
- Description: ${brand.short_description || brand.detailed_description || 'Not specified'}
- Target Audience: ${brand.primary_audience || 'Not specified'}
- Brand Tones: ${(brand.tones || []).join(', ') || 'Not specified'}
- Writing Style: ${brand.writing_style || 'Not specified'}
- Key Themes: ${(brand.key_themes || []).join(', ') || 'Not specified'}
- Products/Services: ${(brand.products || []).join(', ') || 'Not specified'}
- Pain Points of Audience: ${(brand.pain_points || []).join(', ') || 'Not specified'}
- Content Goals: ${(brand.content_goals || []).join(', ') || 'Not specified'}
- Sample Post Style: ${brand.sample_prompt || (brand.sample_posts || []).filter(Boolean)[0] || 'Not specified'}
`
    : `No brand profile found. Write in a general professional voice.`;

  return `You are a world-class social media copywriter.

${brandContext}

USER'S POST IDEA: "${userPrompt}"
PLATFORM: ${platform.toUpperCase()}
CONTENT GOAL: ${goal}
TONE OVERRIDE: ${tone === 'Default (Brand)' ? 'Match the brand tone above' : tone}
ADD EMOJIS: ${addEmojis ? 'Yes, use relevant emojis naturally' : 'No emojis'}
ADD HASHTAGS: ${addHashtags ? 'Yes, add 5-8 relevant hashtags at the end' : 'No hashtags'}

PLATFORM INSTRUCTIONS:
${PLATFORM_INSTRUCTIONS[platform] || PLATFORM_INSTRUCTIONS.linkedin}

Write ONLY the post content. No explanations, no preamble, no quotation marks wrapping the output. Just the ready-to-publish post.`;
}

// ─── Groq Generate Helper ───
async function generateWithGroq(prompt) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

// ─── Separator for terminal readability ───
function logSeparator(char = '─', length = 60) {
  console.log(char.repeat(length));
}

// ─── POST /api/generate ───
app.post('/api/generate', async (req, res) => {
  const { brand, userPrompt, platforms, goal, tone, addEmojis, addHashtags } = req.body;

  logSeparator('═');
  console.log('🚀  NEW GENERATION REQUEST');
  logSeparator('═');

  console.log('\n📝  USER PROMPT:');
  console.log(`   "${userPrompt}"`);

  console.log('\n🌐  PLATFORMS:', platforms?.join(', ') || 'None');
  console.log('🎯  GOAL:', goal);
  console.log('🎙️   TONE:', tone);
  console.log('😄  Emojis:', addEmojis ? 'Yes' : 'No');
  console.log('#️⃣   Hashtags:', addHashtags ? 'Yes' : 'No');

  if (brand) {
    console.log('\n🏷️   BRAND PROFILE:');
    logSeparator();
    console.log('  Company     :', brand.company_name || '—');
    console.log('  Industry    :', brand.industry || '—');
    console.log('  Description :', brand.short_description || brand.detailed_description || '—');
    console.log('  Audience    :', brand.primary_audience || '—');
    console.log('  Tones       :', (brand.tones || []).join(', ') || '—');
    console.log('  Style       :', brand.writing_style || '—');
    console.log('  Themes      :', (brand.key_themes || []).join(', ') || '—');
    console.log('  Products    :', (brand.products || []).join(', ') || '—');
    console.log('  Pain Points :', (brand.pain_points || []).join(', ') || '—');
    console.log('  Goals       :', (brand.content_goals || []).join(', ') || '—');
    logSeparator();
  } else {
    console.log('\n⚠️   No brand profile attached.');
  }

  if (!userPrompt || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Missing prompt or platforms.' });
  }

  try {
    console.log('\n⚡  Generating content with Groq...\n');

    const results = await Promise.all(
      platforms.map(async (pid) => {
        const prompt = buildPrompt({ brand, userPrompt, platform: pid, goal, tone, addEmojis, addHashtags });
        const rawText = await generateWithGroq(prompt);

        console.log(`✅  [${pid.toUpperCase()}] Generated (${rawText.split(/\s+/).length} words)`);
        logSeparator();
        console.log(rawText);
        logSeparator();
        console.log();

        return {
          platform: pid,
          text: rawText,
          wordCount: rawText.split(/\s+/).length,
        };
      })
    );

    logSeparator('═');
    console.log(`✨  Done! ${results.length} post(s) generated.`);
    logSeparator('═');
    console.log();

    res.json({ posts: results });
  } catch (err) {
    console.error('\n❌  Groq generation error:', err.message);
    res.status(500).json({ error: 'Groq generation failed.', details: err.message });
  }
});

// ─── POST /api/post-action ───
app.post('/api/post-action', async (req, res) => {
  const { text, platform, action } = req.body;

  const actionPrompts = {
    shorter: `Shorten this ${platform} post to 60% of its length while keeping the key message and impact. Return ONLY the shortened post, no explanation:\n\n${text}`,
    longer: `Expand this ${platform} post by adding more detail, storytelling, or examples. Return ONLY the expanded post:\n\n${text}`,
    regenerate: `Completely rewrite this ${platform} post with a different angle or hook. Keep the topic but make it feel fresh. Return ONLY the rewritten post:\n\n${text}`,
    emoji: `Add relevant emojis to this post to make it more engaging. Don't overdo it. Return ONLY the post with emojis added:\n\n${text}`,
    hashtags: `Add 5-8 highly relevant hashtags to this post at the end. Return ONLY the post with hashtags:\n\n${text}`,
  };

  if (!actionPrompts[action]) {
    return res.status(400).json({ error: 'Unknown action.' });
  }

  console.log(`\n🔧  Post action: [${action.toUpperCase()}] on ${platform}`);

  try {
    const newText = await generateWithGroq(actionPrompts[action]);
    console.log(`✅  Action done. (${newText.split(/\s+/).length} words)`);
    console.log(newText);

    res.json({ text: newText });
  } catch (err) {
    console.error('❌  Action error:', err.message);
    res.status(500).json({ error: 'Action failed.', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Postal backend is running!' });
});

app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(60));
  console.log(`🚀  Postal backend running on http://localhost:${PORT}`);
  console.log('═'.repeat(60) + '\n');
});