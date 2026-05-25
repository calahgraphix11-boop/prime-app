import { useState } from 'react';
import { FileDown, Loader, AlertCircle } from 'lucide-react';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';

const FIELD = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-white/75 block mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2.5 rounded-xl glass-input text-sm';
const textareaCls = 'w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none';

export default function InternshipReport() {
  const [info, setInfo] = useState({
    fullName: '', regNumber: '', department: '', academicYear: '',
    supervisorName: '', hostName: '', hostLocation: '',
    startDate: '', endDate: '', reportTitle: '',
  });
  const [content, setContent] = useState({
    acknowledgements: '', hostDescription: '', activities: '',
    problems: '', solutions: '', conclusion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setI = (k) => (e) => setInfo((p) => ({ ...p, [k]: e.target.value }));
  const setC = (k) => (e) => setContent((p) => ({ ...p, [k]: e.target.value }));

  const generate = async () => {
    if (!info.fullName || !info.regNumber || !info.reportTitle) {
      setError('Please fill in at least your name, registration number, and report title.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const userPrompt = `
Student: ${info.fullName} | Reg: ${info.regNumber} | Dept: ${info.department}
Academic Year: ${info.academicYear} | Supervisor: ${info.supervisorName}
Host Institution: ${info.hostName}, ${info.hostLocation}
Internship Period: ${info.startDate} to ${info.endDate}
Report Title: ${info.reportTitle}

ACKNOWLEDGEMENTS NOTES:
${content.acknowledgements || 'No notes provided.'}

HOST INSTITUTION DESCRIPTION NOTES (location, history, vision, mission, activities):
${content.hostDescription || 'No notes provided.'}

INTERNSHIP ACTIVITIES NOTES (tasks performed):
${content.activities || 'No notes provided.'}

PROBLEMS ENCOUNTERED NOTES:
${content.problems || 'No notes provided.'}

PROPOSED SOLUTIONS NOTES:
${content.solutions || 'No notes provided.'}

CONCLUSION AND RECOMMENDATIONS NOTES:
${content.conclusion || 'No notes provided.'}

Expand each section into well-structured formal academic English. Return only valid JSON with these exact keys: acknowledgements, dedication, introduction, chapter1, chapter2_activities, chapter2_problems, chapter2_solutions, conclusion.
`.trim();

      const messages = [{ role: 'user', content: userPrompt }];
      const systemPrompt = `You are an expert academic report writer specializing in Cameroonian university internship reports. Your job is to generate a complete, detailed, professional internship report for a COLTECH (College of Technology, University of Bamenda) student based on minimal input.

CRITICAL RULES:
- Generate LONG, detailed, academic content for every section — minimum 3-4 paragraphs per section
- If the user provides minimal info, use your knowledge to fill in realistic, plausible academic content
- Write in formal academic English suitable for university submission
- For Chapter 1, generate detailed content about the host institution's location geography (relief, soil, climate, vegetation of that Cameroonian city), infrastructure, history, vision, mission, objectives, organizational structure, and activities
- For Chapter 2, expand the student's notes into detailed technical descriptions of activities performed, with professional terminology appropriate to their department
- Make the acknowledgements warm and personal, the dedication heartfelt
- The introduction must explain what an internship is, its importance, and the student's specific objectives
- Problems and solutions must be realistic and specific to their field
- The conclusion must summarize learnings and make specific recommendations

Return ONLY a valid JSON object with these exact keys: acknowledgements, dedication, introduction, chapter1_location, chapter1_institution, chapter1_vision_mission, chapter1_organization, chapter1_activities, chapter2_activities, chapter2_problems, chapter2_solutions, conclusion, recommendations. No markdown, no explanation, just the JSON.`;
      const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/internship-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages, systemPrompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'API request failed');
      }

      const data = await res.json();
      const raw = data.content?.[0]?.text || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response. Please try again.');
      const sections = JSON.parse(jsonMatch[0]);

      await buildAndDownload(info, sections);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pt-2 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Internship Report Generator</h1>
        <p className="text-sm text-white/50 mt-0.5">
          Fill in your details and notes — AI will expand them into a formatted Word document.
        </p>
      </div>

      {/* Personal Info */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Personal &amp; Placement Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FIELD label="Student Full Name *">
            <input value={info.fullName} onChange={setI('fullName')} placeholder="e.g. FOMONYUY John" className={inputCls} />
          </FIELD>
          <FIELD label="Registration Number *">
            <input value={info.regNumber} onChange={setI('regNumber')} placeholder="e.g. UBa22T0001" className={inputCls} />
          </FIELD>
          <FIELD label="Department">
            <input value={info.department} onChange={setI('department')} placeholder="e.g. Computer Engineering" className={inputCls} />
          </FIELD>
          <FIELD label="Academic Year">
            <input value={info.academicYear} onChange={setI('academicYear')} placeholder="e.g. 2024/2025" className={inputCls} />
          </FIELD>
          <FIELD label="Supervisor Name">
            <input value={info.supervisorName} onChange={setI('supervisorName')} placeholder="e.g. Dr. NKEMENI Victor" className={inputCls} />
          </FIELD>
          <FIELD label="Host Institution Name">
            <input value={info.hostName} onChange={setI('hostName')} placeholder="e.g. Cameroon Telecommunications" className={inputCls} />
          </FIELD>
          <FIELD label="Host Institution Location">
            <input value={info.hostLocation} onChange={setI('hostLocation')} placeholder="e.g. Bamenda, North West Region" className={inputCls} />
          </FIELD>
          <FIELD label="Internship Dates (Start / End)">
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={info.startDate} onChange={setI('startDate')} className={inputCls} />
              <input type="date" value={info.endDate} onChange={setI('endDate')} className={inputCls} />
            </div>
          </FIELD>
        </div>
        <FIELD label="Report Title *">
          <input value={info.reportTitle} onChange={setI('reportTitle')} placeholder="e.g. Design and Implementation of a Network Monitoring System" className={inputCls} />
        </FIELD>
      </div>

      {/* Content Fields */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Report Content (rough notes)</h2>

        <FIELD label="Acknowledgements">
          <textarea value={content.acknowledgements} onChange={setC('acknowledgements')} rows={3} placeholder="Who do you want to thank? e.g. supervisor, host staff, family..." className={textareaCls} />
        </FIELD>
        <FIELD label="Host Institution Description">
          <textarea value={content.hostDescription} onChange={setC('hostDescription')} rows={4} placeholder="Location, history, vision, mission, main activities..." className={textareaCls} />
        </FIELD>
        <FIELD label="Internship Activities">
          <textarea value={content.activities} onChange={setC('activities')} rows={5} placeholder="What tasks did you perform? What did you learn? What projects did you work on?" className={textareaCls} />
        </FIELD>
        <FIELD label="Problems Encountered">
          <textarea value={content.problems} onChange={setC('problems')} rows={3} placeholder="What difficulties or challenges did you face during the internship?" className={textareaCls} />
        </FIELD>
        <FIELD label="Proposed Solutions">
          <textarea value={content.solutions} onChange={setC('solutions')} rows={3} placeholder="How did you or could you address those problems?" className={textareaCls} />
        </FIELD>
        <FIELD label="Conclusion &amp; Recommendations">
          <textarea value={content.conclusion} onChange={setC('conclusion')} rows={4} placeholder="Summary of experience, what you gained, any recommendations..." className={textareaCls} />
        </FIELD>
      </div>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50"
      >
        {loading ? (
          <><Loader size={16} className="animate-spin" /> Generating report…</>
        ) : (
          <><FileDown size={16} /> Generate &amp; Download Word Document</>
        )}
      </button>
    </div>
  );
}

async function buildAndDownload(info, s) {
  const title = (text, heading) => new Paragraph({
    text,
    heading,
    spacing: { before: 400, after: 200 },
  });

  const body = (text) => new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    spacing: { after: 200, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
  });

  const centered = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text, ...opts })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
  });

  const blank = () => new Paragraph({ text: '' });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
        },
      },
    },
    sections: [{
      children: [
        // Title page
        blank(), blank(),
        centered('REPUBLIC OF CAMEROON', { bold: true, size: 24 }),
        centered('Peace – Work – Fatherland', { italics: true, size: 22 }),
        blank(),
        centered('UNIVERSITY OF BAMENDA', { bold: true, size: 26 }),
        centered('COLLEGE OF TECHNOLOGY (COLTECH)', { bold: true, size: 24 }),
        centered(info.department ? `Department of ${info.department}` : '', { size: 24 }),
        blank(), blank(),
        centered(info.reportTitle, { bold: true, size: 28 }),
        blank(),
        centered('AN INTERNSHIP REPORT', { bold: true, size: 24 }),
        centered(`Submitted in partial fulfilment of the requirements for the degree`, { size: 22 }),
        blank(), blank(),
        centered('Presented by:', { bold: true, size: 24 }),
        centered(info.fullName, { bold: true, size: 26 }),
        centered(`Registration Number: ${info.regNumber}`, { size: 24 }),
        blank(),
        centered(`Supervised by: ${info.supervisorName}`, { size: 24 }),
        blank(),
        centered(`Host Institution: ${info.hostName}`, { size: 24 }),
        centered(info.hostLocation, { size: 22 }),
        blank(),
        centered(`Internship Period: ${info.startDate} – ${info.endDate}`, { size: 22 }),
        blank(), blank(),
        centered(`Academic Year: ${info.academicYear}`, { bold: true, size: 24 }),

        // Dedication
        new Paragraph({ children: [new PageBreak()] }),
        title('DEDICATION', HeadingLevel.HEADING_1),
        ...splitBody(s.dedication),

        // Acknowledgements
        new Paragraph({ children: [new PageBreak()] }),
        title('ACKNOWLEDGEMENTS', HeadingLevel.HEADING_1),
        ...splitBody(s.acknowledgements),

        // Introduction
        new Paragraph({ children: [new PageBreak()] }),
        title('GENERAL INTRODUCTION', HeadingLevel.HEADING_1),
        ...splitBody(s.introduction),

        // Chapter 1
        new Paragraph({ children: [new PageBreak()] }),
        title('CHAPTER ONE: PRESENTATION OF HOST INSTITUTION', HeadingLevel.HEADING_1),
        title('1.1 Geographical Location', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_location),
        title('1.2 Presentation of the Institution', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_institution),
        title('1.3 Vision, Mission and Objectives', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_vision_mission),
        title('1.4 Organisational Structure', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_organization),
        title('1.5 Activities of the Institution', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_activities),

        // Chapter 2
        new Paragraph({ children: [new PageBreak()] }),
        title('CHAPTER TWO: INTERNSHIP ACTIVITIES AND EXPERIENCE', HeadingLevel.HEADING_1),
        title('2.1 Activities Performed', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_activities),
        title('2.2 Problems Encountered', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_problems),
        title('2.3 Proposed Solutions', HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_solutions),

        // Conclusion
        new Paragraph({ children: [new PageBreak()] }),
        title('GENERAL CONCLUSION', HeadingLevel.HEADING_1),
        ...splitBody(s.conclusion),
        title('RECOMMENDATIONS', HeadingLevel.HEADING_1),
        ...splitBody(s.recommendations),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = info.fullName.replace(/\s+/g, '_') || 'Student';
  saveAs(blob, `Internship_Report_${safeName}.docx`);
}

function splitBody(text = '') {
  return text.split(/\n+/).filter(Boolean).map(
    (line) => new Paragraph({
      children: [new TextRun({ text: line, size: 24 })],
      spacing: { after: 200, line: 360 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );
}
