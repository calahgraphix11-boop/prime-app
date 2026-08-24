import { useState } from 'react';
import { FileDown, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';
import { useApp } from '../context/AppContext';

// Static docx template strings, in standard Cameroonian academic conventions
// for each language (the Anglophone and Francophone university subsystems
// use distinct terminology, not literal translations of each other).
const TEMPLATES = {
  en: {
    republic: 'REPUBLIC OF CAMEROON',
    motto: 'Peace – Work – Fatherland',
    university: 'UNIVERSITY OF BAMENDA',
    college: 'COLLEGE OF TECHNOLOGY (COLTECH)',
    departmentOf: (dept) => (dept ? `Department of ${dept}` : ''),
    reportKind: 'AN INTERNSHIP REPORT',
    submittedFor: 'Submitted in partial fulfilment of the requirements for the degree',
    presentedBy: 'Presented by:',
    regNumber: (v) => `Registration Number: ${v}`,
    supervisedBy: (v) => `Supervised by: ${v}`,
    hostInstitution: (v) => `Host Institution: ${v}`,
    internshipPeriod: (start, end) => `Internship Period: ${start} – ${end}`,
    academicYear: (v) => `Academic Year: ${v}`,
    dedication: 'DEDICATION',
    acknowledgements: 'ACKNOWLEDGEMENTS',
    generalIntroduction: 'GENERAL INTRODUCTION',
    chapterOne: 'CHAPTER ONE: PRESENTATION OF HOST INSTITUTION',
    s11: '1.1 Geographical Location',
    s12: '1.2 Presentation of the Institution',
    s13: '1.3 Vision, Mission and Objectives',
    s14: '1.4 Organisational Structure',
    s15: '1.5 Activities of the Institution',
    chapterTwo: 'CHAPTER TWO: INTERNSHIP ACTIVITIES AND EXPERIENCE',
    s21: '2.1 Activities Performed',
    s22: '2.2 Problems Encountered',
    s23: '2.3 Proposed Solutions',
    generalConclusion: 'GENERAL CONCLUSION',
    recommendations: 'RECOMMENDATIONS',
    filePrefix: 'Internship_Report_',
  },
  fr: {
    republic: 'RÉPUBLIQUE DU CAMEROUN',
    motto: 'Paix – Travail – Patrie',
    university: 'UNIVERSITÉ DE BAMENDA',
    college: 'COLLÈGE DE TECHNOLOGIE (COLTECH)',
    departmentOf: (dept) => (dept ? `Département de ${dept}` : ''),
    reportKind: 'RAPPORT DE STAGE',
    submittedFor: "Présenté en vue de l'obtention partielle des exigences du diplôme",
    presentedBy: 'Présenté par :',
    regNumber: (v) => `Matricule : ${v}`,
    supervisedBy: (v) => `Encadré par : ${v}`,
    hostInstitution: (v) => `Structure d'accueil : ${v}`,
    internshipPeriod: (start, end) => `Période de stage : ${start} – ${end}`,
    academicYear: (v) => `Année académique : ${v}`,
    dedication: 'DÉDICACE',
    acknowledgements: 'REMERCIEMENTS',
    generalIntroduction: 'INTRODUCTION GÉNÉRALE',
    chapterOne: "CHAPITRE PREMIER : PRÉSENTATION DE LA STRUCTURE D'ACCUEIL",
    s11: '1.1 Situation géographique',
    s12: '1.2 Présentation de la structure',
    s13: '1.3 Vision, mission et objectifs',
    s14: '1.4 Structure organisationnelle',
    s15: '1.5 Activités de la structure',
    chapterTwo: 'CHAPITRE II : DÉROULEMENT DU STAGE ET EXPÉRIENCE ACQUISE',
    s21: '2.1 Activités menées',
    s22: '2.2 Difficultés rencontrées',
    s23: '2.3 Solutions proposées',
    generalConclusion: 'CONCLUSION GÉNÉRALE',
    recommendations: 'RECOMMANDATIONS',
    filePrefix: 'Rapport_de_Stage_',
  },
};

const FIELD = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-white/75 block mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2.5 rounded-xl glass-input text-sm';
const textareaCls = 'w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none';

export default function InternshipReport() {
  const { t, lang } = useApp();
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
      setError(t.fillRequiredFields);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userPrompt = lang === 'fr' ? `
Étudiant(e) : ${info.fullName} | Matricule : ${info.regNumber} | Département : ${info.department}
Année académique : ${info.academicYear} | Encadreur : ${info.supervisorName}
Structure d'accueil : ${info.hostName}, ${info.hostLocation}
Période de stage : ${info.startDate} au ${info.endDate}
Titre du rapport : ${info.reportTitle}

NOTES POUR LES REMERCIEMENTS :
${content.acknowledgements || 'Aucune note fournie.'}

NOTES SUR LA STRUCTURE D'ACCUEIL (localisation, historique, vision, mission, activités) :
${content.hostDescription || 'Aucune note fournie.'}

NOTES SUR LES ACTIVITÉS DE STAGE (tâches effectuées) :
${content.activities || 'Aucune note fournie.'}

NOTES SUR LES DIFFICULTÉS RENCONTRÉES :
${content.problems || 'Aucune note fournie.'}

NOTES SUR LES SOLUTIONS PROPOSÉES :
${content.solutions || 'Aucune note fournie.'}

NOTES POUR LA CONCLUSION ET LES RECOMMANDATIONS :
${content.conclusion || 'Aucune note fournie.'}

Développez chaque section en un texte académique français formel et bien structuré. Retournez uniquement un objet JSON valide avec exactement ces clés : acknowledgements, dedication, introduction, chapter1_location, chapter1_institution, chapter1_vision_mission, chapter1_organization, chapter1_activities, chapter2_activities, chapter2_problems, chapter2_solutions, conclusion, recommendations.
`.trim() : `
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

Expand each section into well-structured formal academic English. Return only valid JSON with these exact keys: acknowledgements, dedication, introduction, chapter1_location, chapter1_institution, chapter1_vision_mission, chapter1_organization, chapter1_activities, chapter2_activities, chapter2_problems, chapter2_solutions, conclusion, recommendations.
`.trim();

      const messages = [{ role: 'user', content: userPrompt }];
      const systemPrompt = lang === 'fr' ? `Vous êtes un rédacteur académique expert, spécialisé dans les rapports de stage universitaires camerounais. Votre tâche consiste à générer un rapport de stage complet, détaillé et professionnel pour un(e) étudiant(e) du COLTECH (Collège de Technologie, Université de Bamenda) à partir d'informations minimales.

RÈGLES IMPORTANTES :
- Générez un contenu LONG, détaillé et académique pour chaque section — au minimum 3 à 4 paragraphes par section
- Si l'utilisateur fournit peu d'informations, utilisez vos connaissances pour compléter avec un contenu académique réaliste et plausible
- Rédigez en français académique soutenu, conforme aux normes de rédaction universitaire camerounaise
- Pour le Chapitre 1, développez un contenu détaillé sur la situation géographique de la structure d'accueil (relief, sol, climat, végétation de cette ville camerounaise), ses infrastructures, son historique, sa vision, sa mission, ses objectifs, son organigramme et ses activités
- Pour le Chapitre 2, développez les notes de l'étudiant(e) en descriptions techniques détaillées des activités effectuées, avec une terminologie professionnelle adaptée à son département
- Rendez les remerciements chaleureux et personnels, et la dédicace sincère
- L'introduction générale doit expliquer ce qu'est un stage, son importance, ainsi que les objectifs spécifiques de l'étudiant(e)
- Les problèmes et solutions doivent être réalistes et propres à son domaine
- La conclusion générale doit résumer les acquis et formuler des recommandations précises

Retournez UNIQUEMENT un objet JSON valide avec exactement ces clés : acknowledgements, dedication, introduction, chapter1_location, chapter1_institution, chapter1_vision_mission, chapter1_organization, chapter1_activities, chapter2_activities, chapter2_problems, chapter2_solutions, conclusion, recommendations. Pas de markdown, pas d'explication, seulement le JSON.` : `You are an expert academic report writer specializing in Cameroonian university internship reports. Your job is to generate a complete, detailed, professional internship report for a COLTECH (College of Technology, University of Bamenda) student based on minimal input.

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
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/internship-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
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

      await buildAndDownload(info, sections, lang);
    } catch (e) {
      setError(e.message || t.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pt-2 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.internshipReportTitle}</h1>
        <p className="text-sm text-white/50 mt-0.5">
          {t.internshipReportSubtitle}
        </p>
      </div>

      {/* Personal Info */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t.personalPlacementInfo}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FIELD label={t.studentFullName}>
            <input value={info.fullName} onChange={setI('fullName')} placeholder="e.g. FOMONYUY John" className={inputCls} />
          </FIELD>
          <FIELD label={t.registrationNumber}>
            <input value={info.regNumber} onChange={setI('regNumber')} placeholder="e.g. UBa22T0001" className={inputCls} />
          </FIELD>
          <FIELD label={t.department}>
            <input value={info.department} onChange={setI('department')} placeholder={t.departmentPlaceholder} className={inputCls} />
          </FIELD>
          <FIELD label={t.academicYear}>
            <input value={info.academicYear} onChange={setI('academicYear')} placeholder="e.g. 2024/2025" className={inputCls} />
          </FIELD>
          <FIELD label={t.supervisorName}>
            <input value={info.supervisorName} onChange={setI('supervisorName')} placeholder="e.g. Dr. NKEMENI Victor" className={inputCls} />
          </FIELD>
          <FIELD label={t.hostInstitutionName}>
            <input value={info.hostName} onChange={setI('hostName')} placeholder="e.g. Cameroon Telecommunications" className={inputCls} />
          </FIELD>
          <FIELD label={t.hostInstitutionLocation}>
            <input value={info.hostLocation} onChange={setI('hostLocation')} placeholder={t.hostLocationPlaceholder} className={inputCls} />
          </FIELD>
          <FIELD label={t.internshipDates}>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={info.startDate} onChange={setI('startDate')} className={inputCls} />
              <input type="date" value={info.endDate} onChange={setI('endDate')} className={inputCls} />
            </div>
          </FIELD>
        </div>
        <FIELD label={t.reportTitleLabel}>
          <input value={info.reportTitle} onChange={setI('reportTitle')} placeholder={t.reportTitlePlaceholder} className={inputCls} />
        </FIELD>
      </div>

      {/* Content Fields */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t.reportContentNotes}</h2>

        <FIELD label={t.acknowledgementsLabel}>
          <textarea value={content.acknowledgements} onChange={setC('acknowledgements')} rows={3} placeholder={t.acknowledgementsPlaceholder} className={textareaCls} />
        </FIELD>
        <FIELD label={t.hostInstitutionDescLabel}>
          <textarea value={content.hostDescription} onChange={setC('hostDescription')} rows={4} placeholder={t.hostInstitutionDescPlaceholder} className={textareaCls} />
        </FIELD>
        <FIELD label={t.internshipActivitiesLabel}>
          <textarea value={content.activities} onChange={setC('activities')} rows={5} placeholder={t.internshipActivitiesPlaceholder} className={textareaCls} />
        </FIELD>
        <FIELD label={t.problemsEncounteredLabel}>
          <textarea value={content.problems} onChange={setC('problems')} rows={3} placeholder={t.problemsEncounteredPlaceholder} className={textareaCls} />
        </FIELD>
        <FIELD label={t.proposedSolutionsLabel}>
          <textarea value={content.solutions} onChange={setC('solutions')} rows={3} placeholder={t.proposedSolutionsPlaceholder} className={textareaCls} />
        </FIELD>
        <FIELD label={t.conclusionRecommendationsLabel}>
          <textarea value={content.conclusion} onChange={setC('conclusion')} rows={4} placeholder={t.conclusionRecommendationsPlaceholder} className={textareaCls} />
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
          <><Loader size={16} className="animate-spin" /> {t.generatingReport}</>
        ) : (
          <><FileDown size={16} /> {t.generateDownloadWord}</>
        )}
      </button>
    </div>
  );
}

async function buildAndDownload(info, s, lang = 'en') {
  const tpl = TEMPLATES[lang] || TEMPLATES.en;
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
        centered(tpl.republic, { bold: true, size: 24 }),
        centered(tpl.motto, { italics: true, size: 22 }),
        blank(),
        centered(tpl.university, { bold: true, size: 26 }),
        centered(tpl.college, { bold: true, size: 24 }),
        centered(tpl.departmentOf(info.department), { size: 24 }),
        blank(), blank(),
        centered(info.reportTitle, { bold: true, size: 28 }),
        blank(),
        centered(tpl.reportKind, { bold: true, size: 24 }),
        centered(tpl.submittedFor, { size: 22 }),
        blank(), blank(),
        centered(tpl.presentedBy, { bold: true, size: 24 }),
        centered(info.fullName, { bold: true, size: 26 }),
        centered(tpl.regNumber(info.regNumber), { size: 24 }),
        blank(),
        centered(tpl.supervisedBy(info.supervisorName), { size: 24 }),
        blank(),
        centered(tpl.hostInstitution(info.hostName), { size: 24 }),
        centered(info.hostLocation, { size: 22 }),
        blank(),
        centered(tpl.internshipPeriod(info.startDate, info.endDate), { size: 22 }),
        blank(), blank(),
        centered(tpl.academicYear(info.academicYear), { bold: true, size: 24 }),

        // Dedication
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.dedication, HeadingLevel.HEADING_1),
        ...splitBody(s.dedication),

        // Acknowledgements
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.acknowledgements, HeadingLevel.HEADING_1),
        ...splitBody(s.acknowledgements),

        // Introduction
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.generalIntroduction, HeadingLevel.HEADING_1),
        ...splitBody(s.introduction),

        // Chapter 1
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.chapterOne, HeadingLevel.HEADING_1),
        title(tpl.s11, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_location),
        title(tpl.s12, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_institution),
        title(tpl.s13, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_vision_mission),
        title(tpl.s14, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_organization),
        title(tpl.s15, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter1_activities),

        // Chapter 2
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.chapterTwo, HeadingLevel.HEADING_1),
        title(tpl.s21, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_activities),
        title(tpl.s22, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_problems),
        title(tpl.s23, HeadingLevel.HEADING_2),
        ...splitBody(s.chapter2_solutions),

        // Conclusion
        new Paragraph({ children: [new PageBreak()] }),
        title(tpl.generalConclusion, HeadingLevel.HEADING_1),
        ...splitBody(s.conclusion),
        title(tpl.recommendations, HeadingLevel.HEADING_1),
        ...splitBody(s.recommendations),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = info.fullName.replace(/\s+/g, '_') || 'Student';
  saveAs(blob, `${tpl.filePrefix}${safeName}.docx`);
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
