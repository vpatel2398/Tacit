/**
 * Seeds a demo company with realistic data so the hosted app tells a story
 * the moment someone logs in.
 *
 * Run locally (never from the deployed app):
 *   node scripts/seed-demo.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY     (Supabase > Settings > API > service_role)
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN
 *
 * Safe to re-run: it deletes the previous demo company first.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// --- load .env.local without a dependency -----------------------------------
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) process.env[match[1]] ??= match[2].replace(/^["']|["']$/g, '')
  }
} catch {
  console.log('No .env.local found — relying on shell environment.')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

const DEMO_EMAIL = 'demo@knowledgelayer.app'
const DEMO_PASSWORD = 'demo1234'

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: CF_API_TOKEN,
})) {
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local and try again.`)
    process.exit(1)
  }
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// --- embedding helper --------------------------------------------------------
async function embed(texts) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-small-en-v1.5`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CF_API_TOKEN}`,
    },
    body: JSON.stringify({ text: texts }),
  })
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`)
  const payload = await res.json()
  if (!Array.isArray(payload?.result?.data)) {
    throw new Error(`Unexpected embedding response: ${JSON.stringify(payload).slice(0, 200)}`)
  }
  return payload.result.data
}

// --- demo content ------------------------------------------------------------
const COMPANY = { name: 'Meridian Precision Manufacturing', industry: 'Manufacturing' }

const HOLDERS = [
  {
    key: 'sarah',
    name: 'Sarah Chen',
    role: 'Senior Process Engineer',
    department: 'Manufacturing',
    tenure_years: 32,
    retiringInDays: 95,
    domains: ['Injection moulding', 'Supplier qualification', 'Tooling maintenance', 'Legacy PLC systems'],
    completeness: 0.42,
  },
  {
    key: 'marcus',
    name: 'Marcus Webb',
    role: 'Maintenance Supervisor',
    department: 'Facilities',
    tenure_years: 19,
    retiringInDays: null,
    domains: ['Preventive maintenance', 'Hydraulic systems', 'Line 3 press'],
    completeness: 0.61,
  },
  {
    key: 'priya',
    name: 'Priya Nair',
    role: 'Quality Manager',
    department: 'Quality Assurance',
    tenure_years: 14,
    retiringInDays: null,
    domains: ['ISO 9001 auditing', 'CAPA process', 'Customer complaint handling'],
    completeness: 0.55,
  },
]

const CHUNKS = [
  // --- Sarah Chen ---
  {
    holder: 'sarah',
    chunk_type: 'warning',
    content:
      'Delta Components should never be the sole supplier for any part with a tolerance tighter than ±0.05mm. Their internal inspection lags production by about three weeks, so defects surface long after the batch has shipped and cleared incoming QA.',
    source_quote: "Their inspection lags production by weeks — it doesn't show up in an audit.",
    confidence: 0.95,
  },
  {
    holder: 'sarah',
    chunk_type: 'failure_pattern',
    content:
      'In 2017 a Delta Components batch passed incoming inspection and failed in the field three weeks later, forcing a partial recall. The root cause was their delayed inspection cycle, not the parts themselves. Any supplier whose QA runs behind their shipping schedule carries the same risk.',
    source_quote: 'We had to pull product back. It cost us the Henderson account for two years.',
    confidence: 0.98,
  },
  {
    holder: 'sarah',
    chunk_type: 'heuristic',
    content:
      'For any order above 5,000 units on a critical part, place a parallel qualifying order with a second supplier. The extra cost is trivial next to a line stoppage, and it keeps the backup supplier qualified without a fresh approval cycle.',
    source_quote: 'Always run a parallel order over five thousand units. Always.',
    confidence: 0.92,
  },
  {
    holder: 'sarah',
    chunk_type: 'contact',
    content:
      'Maria in Procurement must sign off before any new supplier is added to the approved list. She keeps the historical performance records that never made it into the ERP system.',
    source_quote: "Call Maria first. She's got twenty years of supplier history in her head and a filing cabinet.",
    confidence: 0.88,
  },
  {
    holder: 'sarah',
    chunk_type: 'tribal_rule',
    content:
      'Tooling changes on Line 2 are scheduled for Thursday mornings only. The Friday shift is short-staffed and a failed changeover going into the weekend means the line sits idle until Monday.',
    source_quote: "Nobody wrote this down, but you don't touch Line 2 tooling on a Friday.",
    confidence: 0.85,
  },
  {
    holder: 'sarah',
    chunk_type: 'workaround',
    content:
      'The Line 4 PLC occasionally hangs after a power interruption and will not respond to the normal restart. The fix is to cycle the main breaker, wait a full 90 seconds for the capacitors to discharge, then power up before the HMI. Restarting in the other order leaves it in the same hung state.',
    source_quote: 'Breaker off, count to ninety, then bring it up. HMI last.',
    confidence: 0.9,
  },
  {
    holder: 'sarah',
    chunk_type: 'process',
    content:
      'Mould qualification runs in four stages: dimensional check on the first ten shots, a 200-shot stability run, a full-cavity dimensional report, then a 24-hour production trial before release. Skipping the stability run is the most common shortcut and the most common cause of downstream scrap.',
    source_quote: 'People skip the stability run to save a day. It costs a week later.',
    confidence: 0.93,
  },
  // --- Marcus Webb ---
  {
    holder: 'marcus',
    chunk_type: 'warning',
    content:
      'The 400-tonne press on Line 3 shows a hydraulic pressure reading roughly 8% higher than actual at the gauge. Anyone trusting the gauge reading will under-pressurise the system. The correction is documented nowhere except on a label someone taped inside the panel door.',
    source_quote: 'Gauge reads high by about eight percent. Has done since the 2019 rebuild.',
    confidence: 0.94,
  },
  {
    holder: 'marcus',
    chunk_type: 'heuristic',
    content:
      'A rising whine from a press bearing means roughly two weeks of remaining life. A grinding or knocking sound means it should be pulled the same shift. Judging by sound is faster and more reliable than the vibration monitoring on these older units.',
    source_quote: 'Whine, you plan. Grind, you stop.',
    confidence: 0.87,
  },
  {
    holder: 'marcus',
    chunk_type: 'failure_pattern',
    content:
      'The 2021 Line 3 press failure was traced to a hydraulic filter that was being changed on schedule but with the wrong part number — a visually identical filter with a coarser rating. Contamination built up over eight months before the pump seized.',
    source_quote: 'Same box, same size, wrong micron rating. Nobody caught it for eight months.',
    confidence: 0.96,
  },
  {
    holder: 'marcus',
    chunk_type: 'process',
    content:
      'Line 3 lockout requires isolating both the main electrical disconnect and the hydraulic accumulator, in that order. The accumulator holds pressure after electrical isolation, so electrical-only lockout leaves stored energy in the system.',
    source_quote: 'Electrical first, then bleed the accumulator. The accumulator is the one that gets people.',
    confidence: 0.97,
  },
  // --- Priya Nair ---
  {
    holder: 'priya',
    chunk_type: 'process',
    content:
      'CAPA investigations follow containment, root cause, corrective action, then effectiveness verification at 30 and 90 days. The 90-day check is the one auditors ask for and the one most often missed, because the file gets closed after the 30-day review.',
    source_quote: 'Everyone does the thirty-day check. The ninety-day one is what auditors actually pull.',
    confidence: 0.91,
  },
  {
    holder: 'priya',
    chunk_type: 'tribal_rule',
    content:
      'Internal audit prep starts six weeks before the external ISO audit, not four as the procedure states. Four weeks has never been enough to close findings from the internal audit before the external auditor arrives.',
    source_quote: 'The SOP says four weeks. Four weeks has never once been enough.',
    confidence: 0.86,
  },
  {
    holder: 'priya',
    chunk_type: 'decision',
    content:
      'We moved from pass/fail supplier approval to a weighted scorecard in 2022 because binary approval kept re-qualifying suppliers who were technically compliant but chronically late. The scorecard weights on-time delivery at 30%, which surfaced two problem suppliers within a quarter.',
    source_quote: 'Pass/fail hid the late ones. They passed every time and still wrecked our schedule.',
    confidence: 0.89,
  },
  {
    holder: 'priya',
    chunk_type: 'contact',
    content:
      'For customer complaints involving the automotive accounts, loop in the account engineer before responding. Automotive customers escalate through their own supplier quality process and an uncoordinated reply can trigger a formal corrective action request.',
    source_quote: "Never answer an automotive complaint alone. They'll turn it into an SCAR.",
    confidence: 0.84,
  },
]

const GAPS = [
  {
    holder: 'sarah',
    severity: 'critical',
    description:
      'No knowledge captured about how she decides when to halt a production run versus letting it finish and quarantining the output.\n\nSuggested question: Walk me through the last time you stopped a run mid-batch. What did you see, and how did you weigh stopping against quarantining?',
  },
  {
    holder: 'sarah',
    severity: 'critical',
    description:
      'The Line 4 PLC is legacy hardware she is the only person who can service. Nothing captured about diagnosing faults beyond the restart workaround.\n\nSuggested question: If the Line 4 PLC throws a fault that the restart sequence does not clear, what do you check next?',
  },
  {
    holder: 'sarah',
    severity: 'high',
    description:
      'Documents describe a mould storage and rotation procedure she owns, but nothing has been captured about how she decides rotation priority.\n\nSuggested question: How do you decide which moulds get serviced first when several are due at once?',
  },
  {
    holder: 'marcus',
    severity: 'high',
    description:
      'No knowledge captured about vendor relationships for press repair — who to call, who is reliable, typical lead times.\n\nSuggested question: When a press needs outside repair, who do you call and why that vendor over the others?',
  },
  {
    holder: 'marcus',
    severity: 'medium',
    description:
      'Preventive maintenance intervals are documented, but nothing captured about when he deviates from them and why.\n\nSuggested question: When do you pull a machine early or push a service out past its scheduled interval?',
  },
  {
    holder: 'priya',
    severity: 'high',
    description:
      'Nothing captured about handling a failed external audit finding — the escalation path and who needs to be involved.\n\nSuggested question: Talk me through what happens the day an external auditor writes a major finding.',
  },
  {
    holder: 'priya',
    severity: 'low',
    description:
      'No knowledge captured about training new quality inspectors beyond the formal onboarding.\n\nSuggested question: What do you teach a new inspector that is not in the training material?',
  },
]

const SESSIONS = [
  {
    holder: 'sarah',
    session_number: 1,
    transcript: [
      {
        role: 'agent',
        content:
          "You've been with Meridian for 32 years and your profile lists supplier qualification as a core domain. Tell me about a supplier decision that went badly — what did you learn from it?",
      },
      {
        role: 'holder',
        content:
          "The big one was Delta Components in 2017. They shipped us a batch that passed incoming inspection clean, and three weeks later parts started failing in the field. We had to pull product back. It cost us the Henderson account for two years. Turned out their internal inspection lags production by weeks — it doesn't show up in an audit because on paper their process is fine. Now I won't let them be sole source on anything tighter than five hundredths. And always run a parallel order over five thousand units. Always. The extra cost is nothing next to a stopped line.",
      },
      {
        role: 'agent',
        content:
          'That parallel-order rule is useful. Who has to sign off before a new supplier gets added to the approved list?',
      },
      {
        role: 'holder',
        content:
          "Call Maria in procurement first. She's got twenty years of supplier history in her head and a filing cabinet, and none of it made it into the ERP when we migrated. If Maria says a supplier was trouble in 2009, believe her, because there's no record of it anywhere else.",
      },
    ],
  },
  {
    holder: 'sarah',
    session_number: 2,
    transcript: [
      {
        role: 'agent',
        content:
          'Your profile lists legacy PLC systems. Are there machines here that only you know how to bring back up?',
      },
      {
        role: 'holder',
        content:
          "Line 4. The PLC hangs after any power interruption and won't come back with a normal restart. What works is breaker off, count to ninety so the caps discharge, then power up — and bring the HMI up last. If you do it in the other order it just hangs again. I've shown two people and neither of them are still here.",
      },
    ],
  },
  {
    holder: 'marcus',
    session_number: 1,
    transcript: [
      {
        role: 'agent',
        content:
          "You supervise maintenance on Line 3. What's something about that press a new technician would get wrong?",
      },
      {
        role: 'holder',
        content:
          "The pressure gauge. It reads high by about eight percent, has done since the 2019 rebuild. If you trust it you'll under-pressurise the system. There's a label taped inside the panel door and that's the only place it's written down. Also for lockout — electrical first, then bleed the accumulator. The accumulator is the one that gets people, it holds pressure after you've killed the power.",
      },
    ],
  },
  {
    holder: 'priya',
    session_number: 1,
    transcript: [
      {
        role: 'agent',
        content: 'What do auditors consistently find that your team consistently misses?',
      },
      {
        role: 'holder',
        content:
          "The ninety-day effectiveness check on CAPAs. Everyone does the thirty-day check and then the file gets closed. The ninety-day one is what auditors actually pull, every time. And honestly the SOP says start audit prep four weeks out — four weeks has never once been enough. We start at six.",
      },
    ],
  },
]

const DOCUMENT = {
  name: 'Line 3 Preventive Maintenance SOP.pdf',
  doc_type: 'SOP',
  chunks: [
    'Line 3 preventive maintenance is performed on a 500-hour cycle. The service covers hydraulic filter replacement, bearing inspection, seal condition check, and calibration verification of the pressure transducer assembly.',
    'Hydraulic filters must match specification MPM-HF-2200 (10 micron). Substitution with visually similar filters of different micron ratings has previously resulted in progressive contamination and pump failure. Verify the part number against the specification, not the packaging.',
    'Mould storage and rotation: moulds not in active production are stored in the climate-controlled rack in Bay 7. Each mould has a service interval based on shot count. Rotation priority is determined by the process engineering lead.',
    'Lockout/tagout for Line 3 requires isolation of the main electrical disconnect and depressurisation of the hydraulic accumulator. Both isolations must be verified before any personnel access the die area.',
    'Records of all preventive maintenance activity are logged in the CMMS within 24 hours of completion. Deviations from the scheduled interval require supervisor approval and a documented reason.',
  ],
}

const QUESTIONS = [
  {
    content: 'Why do we avoid Delta Components for tight-tolerance parts?',
    status: 'answered_by_agent',
    agent_confidence: 0.91,
    agent_answer:
      'Delta Components should not be used as sole source for anything tighter than ±0.05mm. Their internal inspection runs about three weeks behind production, so defects surface well after a batch has shipped and cleared incoming QA — their process looks compliant on an audit but the lag hides problems. This came to a head in 2017 when a batch passed incoming inspection and then failed in the field three weeks later, forcing a partial recall. For orders above 5,000 units on critical parts, place a parallel qualifying order with a second supplier.',
    chunkIndexForCitation: 0,
  },
  {
    content: 'What is the correct order for locking out Line 3?',
    status: 'answered_by_agent',
    agent_confidence: 0.88,
    agent_answer:
      'Isolate the main electrical disconnect first, then bleed the hydraulic accumulator. The order matters: the accumulator retains stored pressure after electrical isolation, so an electrical-only lockout leaves energy in the system. Both isolations must be verified before anyone accesses the die area.',
    chunkIndexForCitation: 10,
  },
  {
    content: 'How long do we keep production records for automotive customers?',
    status: 'routed_to_human',
    agent_confidence: 0.22,
    agent_answer:
      "There's nothing captured about record retention periods for automotive accounts. This one needs a person — routing it to the Quality Manager.",
    chunkIndexForCitation: null,
  },
]

// --- seeding -----------------------------------------------------------------
async function main() {
  console.log('Seeding demo data...\n')

  // 1. Demo auth user
  console.log('  Creating demo user...')
  let authUserId
  const { data: created, error: createErr } = await db.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Demo User' },
  })

  if (created?.user) {
    authUserId = created.user.id
  } else if (createErr) {
    // Already exists — find them
    const { data: list } = await db.auth.admin.listUsers({ perPage: 200 })
    const existing = list?.users?.find(u => u.email === DEMO_EMAIL)
    if (!existing) throw new Error(`Could not create or find demo user: ${createErr.message}`)
    authUserId = existing.id
    await db.auth.admin.updateUserById(authUserId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    })
  }
  console.log(`     demo user ready (${DEMO_EMAIL})`)

  // 2. Clear any previous demo company
  const { data: old } = await db.from('companies').select('id').eq('name', COMPANY.name)
  for (const c of old ?? []) {
    await db.from('companies').delete().eq('id', c.id)
  }
  await db.from('team_members').delete().eq('auth_user_id', authUserId)

  // 3. Company
  console.log('  Creating company...')
  const { data: codeData } = await db.rpc('generate_invite_code')
  const { data: company, error: companyErr } = await db
    .from('companies')
    .insert({ ...COMPANY, invite_code: codeData ?? 'DEMO-FOX-0001' })
    .select()
    .single()
  if (companyErr) throw new Error(`Company insert failed: ${companyErr.message}`)

  // 4. Team member (admin)
  const { data: teamMember, error: memberErr } = await db
    .from('team_members')
    .insert({
      company_id: company.id,
      auth_user_id: authUserId,
      name: 'Demo User',
      email: DEMO_EMAIL,
      role: 'Operations Director',
      department: 'Operations',
      member_role: 'admin',
      seniority_level: 'lead',
    })
    .select()
    .single()
  if (memberErr) throw new Error(`Team member insert failed: ${memberErr.message}`)

  // 5. Topics
  const { data: templates } = await db.from('system_topic_templates').select('name, description')
  if (templates?.length) {
    await db.from('topics').insert(
      templates.map(t => ({
        company_id: company.id,
        name: t.name,
        description: t.description,
        is_system: true,
      }))
    )
  }

  // 6. Holders
  console.log('  Creating knowledge holders...')
  const holderIds = {}
  for (const h of HOLDERS) {
    const retiring_at = h.retiringInDays
      ? new Date(Date.now() + h.retiringInDays * 86400000).toISOString().slice(0, 10)
      : null
    const { data, error } = await db
      .from('knowledge_holders')
      .insert({
        company_id: company.id,
        name: h.name,
        role: h.role,
        department: h.department,
        tenure_years: h.tenure_years,
        retiring_at,
        capture_mode: 'hybrid',
        domains: h.domains,
        status: 'active',
        knowledge_completeness: h.completeness,
      })
      .select()
      .single()
    if (error) throw new Error(`Holder insert failed (${h.name}): ${error.message}`)
    holderIds[h.key] = data.id
  }
  console.log(`     ${HOLDERS.length} holders created`)

  // 7. Sessions
  console.log('  Creating sessions...')
  const sessionIds = {}
  for (const s of SESSIONS) {
    const { data, error } = await db
      .from('sessions')
      .insert({
        holder_id: holderIds[s.holder],
        session_number: s.session_number,
        session_type: 'structured_interview',
        status: 'processed',
        transcript: s.transcript,
      })
      .select()
      .single()
    if (error) throw new Error(`Session insert failed: ${error.message}`)
    sessionIds[`${s.holder}-${s.session_number}`] = data.id
  }

  // 8. Knowledge chunks (embedded)
  console.log('  Embedding knowledge chunks (via Cloudflare Workers AI)...')
  const chunkEmbeddings = await embed(CHUNKS.map(c => c.content))
  const chunkIds = []
  for (let i = 0; i < CHUNKS.length; i++) {
    const c = CHUNKS[i]
    const { data, error } = await db
      .from('knowledge_chunks')
      .insert({
        holder_id: holderIds[c.holder],
        session_id: sessionIds[`${c.holder}-1`] ?? null,
        chunk_type: c.chunk_type,
        capture_source: 'interview',
        content: c.content,
        source_quote: c.source_quote,
        embedding: chunkEmbeddings[i],
        confidence: c.confidence,
        reviewed: true,
      })
      .select()
      .single()
    if (error) throw new Error(`Chunk insert failed: ${error.message}`)
    chunkIds.push(data.id)
  }
  console.log(`     ${CHUNKS.length} chunks embedded and stored`)

  // 9. Document + document chunks
  console.log('  Creating document...')
  const { data: doc, error: docErr } = await db
    .from('documents')
    .insert({
      company_id: company.id,
      name: DOCUMENT.name,
      doc_type: DOCUMENT.doc_type,
      status: 'processed',
    })
    .select()
    .single()
  if (docErr) throw new Error(`Document insert failed: ${docErr.message}`)

  const docEmbeddings = await embed(DOCUMENT.chunks)
  await db.from('document_chunks').insert(
    DOCUMENT.chunks.map((content, i) => ({
      document_id: doc.id,
      content,
      embedding: docEmbeddings[i],
      page_number: i + 1,
    }))
  )

  // 10. Gap flags
  console.log('  Creating gap flags...')
  await db.from('gap_flags').insert(
    GAPS.map(g => ({
      holder_id: holderIds[g.holder],
      description: g.description,
      severity: g.severity,
      status: 'open',
    }))
  )

  // 11. Questions
  console.log('  Creating questions...')
  for (const q of QUESTIONS) {
    await db.from('questions').insert({
      company_id: company.id,
      asked_by: teamMember.id,
      content: q.content,
      status: q.status,
      agent_answer: q.agent_answer,
      agent_confidence: q.agent_confidence,
      answered_by_chunk_id:
        q.chunkIndexForCitation !== null ? chunkIds[q.chunkIndexForCitation] : null,
      routed_to: q.status === 'routed_to_human' ? teamMember.id : null,
      answered_at: q.status === 'answered_by_agent' ? new Date().toISOString() : null,
    })
  }

  console.log('\nDone.\n')
  console.log('  Demo login:')
  console.log(`     email:    ${DEMO_EMAIL}`)
  console.log(`     password: ${DEMO_PASSWORD}`)
  console.log(`\n  Company:  ${COMPANY.name}`)
  console.log(`  Holders:  ${HOLDERS.length}   Chunks: ${CHUNKS.length}   Gaps: ${GAPS.length}`)
}

main().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
