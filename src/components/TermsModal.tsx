import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  FileText, 
  Search, 
  Download, 
  ShieldCheck, 
  Calendar, 
  ChevronRight,
  Printer,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PartKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<PartKey>("A");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const parts = [
    {
      key: "A" as PartKey,
      title: "Part A — Parties & Definitions",
      subtitle: "The parties and essential definitions of this agreement",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">1. The Parties</h4>
            <p className="mb-4">This Service Agreement ("Agreement") is entered into between:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] uppercase font-black text-primary tracking-wider block mb-1">Service Provider</span>
                <p className="font-extrabold text-gray-900 text-xs">Mergemega (Pty) Ltd</p>
                <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
                  <p>Registration No. K2021779747</p>
                  <p>Trading as Mergemega</p>
                  <p>Operator of the SignalMerge platform ("we", "us", "our")</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">The Client</span>
                <p className="font-extrabold text-gray-900 text-xs">Any Registered Business or Individual</p>
                <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
                  <p>Sole proprietors, corporations, or legal entities</p>
                  <p>Subscribers, accessors, or active users of SignalMerge</p>
                  <p>("Client", "you", "your")</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">2. Definitions</h4>
            <div className="space-y-4">
              {[
                { term: '"Agreement"', def: "This entire document including all schedules, annexures, and policies incorporated by reference." },
                { term: '"Platform" or "SignalMerge"', def: "The AI-powered customer search engine and lead-generation platform developed and operated by Mergemega." },
                { term: '"Services"', def: "All features, tools, data, lead signals, reports, and automation capabilities made available through the Platform." },
                { term: '"Lead Signal" or "Intent Signal"', def: "Social media activity (posts, comments, or interactions) identified by the Platform's AI as indicating a potential interest in the Client's products or services." },
                { term: '"Personal Information"', def: "Has the meaning assigned to it in POPIA and includes any information about an identifiable natural or juristic person." },
                { term: '"POPIA"', def: "The Protection of Personal Information Act, No. 4 of 2013 (South Africa)." },
                { term: '"CPA"', def: "The Consumer Protection Act, No. 68 of 2008 (South Africa)." },
                { term: '"ECT Act"', def: "The Electronic Communications and Transactions Act, No. 25 of 2002 (South Africa)." },
                { term: '"GDPR"', def: "The General Data Protection Regulation (EU) 2016/679." },
                { term: '"CCPA"', def: "The California Consumer Privacy Act (USA)." },
                { term: '"Subscription Fee"', def: "The monthly fee payable by the Client for access to the Platform." },
                { term: '"Commencement Date"', def: "The date on which payment of the first month Subscription Fee is received by Mergemega." },
                { term: '"Confidential Information"', def: "Any non-public information disclosed by either party in connection with this Agreement." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-extrabold text-xs text-gray-900 min-w-[140px] block">{item.term}</span>
                  <span className="text-xs text-gray-500">{item.def}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "B" as PartKey,
      title: "Part B — Terms of Service",
      subtitle: "Offered services, obligations, and guarantees",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">3. Services Provided</h4>
            <p className="mb-3">
              3.1 Mergemega agrees to provide the Client with access to the SignalMerge Platform, which offers the following services on the applicable subscription plan:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-xs text-gray-500">
              <li>AI-powered scanning of social media platforms (including TikTok and Instagram) for real-time intent signals relevant to the Client's specified audience.</li>
              <li>Delivery of verified lead signals to the Client via a personalised access link or dashboard.</li>
              <li>Integration with third-party automation tools (including Jotform) to facilitate automated lead-response workflows, subject to those tools' own terms.</li>
              <li>CRM-ready lead export functionality.</li>
              <li>Priority signal filtering configured for the Client's industry and target audience.</li>
            </ul>
            <p className="mb-3">
              3.2 The specific features available to the Client will be those listed in the applicable subscription plan selected at the time of sign-up.
            </p>
            <p>
              3.3 Mergemega reserves the right to update, improve, modify, or discontinue any feature of the Platform at any time, provided such changes do not materially reduce the core service without reasonable notice.
            </p>
          </div>

          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              4. No Guarantee of Results
            </h4>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              <strong>IMPORTANT:</strong> Mergemega does not guarantee any specific number of sales, conversions, student enrolments, revenue, or business outcomes. The Platform identifies and surfaces real people who are actively expressing intent signals on social media. What the Client does with those leads — including how they respond, communicate, and convert — is entirely the Client's responsibility. Past projections or illustrative figures used in proposals are estimates only.
            </p>
            <div className="mt-3 space-y-2 text-[11px] text-amber-800/80">
              <p>4.1 All revenue projections, conversion rate estimates, and lead volume figures provided during the sales or onboarding process are illustrative and not contractually binding.</p>
              <p>4.2 The Client acknowledges that lead quality and volume may vary depending on social media activity, platform algorithm changes, content output, and other factors beyond Mergemega's control.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">5. Client Obligations</h4>
            <p className="mb-3">5.1 The Client agrees to:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500">
              <li>Provide accurate information about their business, target audience, and goals during onboarding.</li>
              <li>Maintain active, regularly updated social media accounts on the platforms specified, as content activity directly affects the volume and quality of intent signals detected.</li>
              <li>Use the Platform and all lead data in compliance with applicable laws, including but not limited to the CPA, POPIA, ECT Act, and any platform-specific terms of service.</li>
              <li>Not use lead data obtained through the Platform to engage in spamming, harassment, unsolicited bulk messaging, or any activity that violates applicable laws.</li>
              <li>Not share, resell, sublicense, or transfer access to the Platform or any lead data to any third party.</li>
              <li>Promptly notify Mergemega of any suspected unauthorized access to their account.</li>
              <li>The Client is solely responsible for how they engage with leads, including compliance with direct marketing laws, consumer rights obligations, and platform community standards.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      key: "C" as PartKey,
      title: "Part C — Refund & Cancellation Policy",
      subtitle: "Subscription models, cancellation notices, and refunds",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">6. Term and Renewal</h4>
            <p className="space-y-2 text-xs text-gray-500">
              6.1 This Agreement commences on the Commencement Date and continues on a month-to-month basis unless terminated in accordance with Clause 7.
              <br /><br />
              6.2 Subscription Fees are billed monthly in advance. Continued use of the Platform beyond the initial month constitutes acceptance of ongoing monthly billing.
              <br /><br />
              6.3 Mergemega reserves the right to adjust pricing with 30 (thirty) days' prior written notice. The Client may terminate the Agreement within that notice period without incurring a cancellation fee.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">7. Cancellation & Termination</h4>
            <p className="text-xs text-gray-500">
              7.1 Either party may terminate this Agreement by providing 30 (thirty) calendar days' written notice to the other party.
              <br /><br />
              7.2 Mergemega may suspend or terminate access immediately, without prior notice, if:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
              <li>The Client breaches any material provision of this Agreement;</li>
              <li>The Client fails to pay any Subscription Fee within 7 (seven) business days of the due date;</li>
              <li>The Client uses the Platform in a manner that is unlawful, fraudulent, or causes harm to Mergemega or third parties.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              7.3 Upon termination, the Client's access to the Platform will cease immediately (or at the end of the notice period, as applicable), and any outstanding fees remain due and payable.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3 font-mono">13. Refund Policy</h4>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4 text-xs text-gray-500">
              <strong className="text-gray-900">LEGAL NOTE:</strong> This Refund Policy has been drafted in compliance with the Consumer Protection Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, and general South African consumer law. A 5-business-day cooling-off period applies to direct marketing transactions. There is no general statutory right of return for services after the cooling-off period. The terms below reflect Mergemega's own fair and voluntary refund policy, which applies in addition to statutory rights.
            </div>

            <div className="space-y-4 text-xs text-gray-500">
              <p>
                <strong>13.1 First Month — Non-Refundable Onboarding Fee:</strong> The first month's Subscription Fee is non-refundable under any circumstances (except as required by the statutory cooling-off right in clause 13.2 below). This is because Mergemega incurs immediate, material costs upon payment, including the custom configuration and build-out of the Client's SignalMerge customer search engine, which begins on receipt of payment.
              </p>
              <p>
                <strong>13.2 Statutory Cooling-Off Right (Direct Marketing):</strong> If this Agreement was concluded as a result of direct marketing (i.e., Mergemega initiated contact with the Client), the Client has the right under section 16 of the CPA and section 44 of the ECT Act to cancel within 5 (five) business days of the date of conclusion of this Agreement, without penalty, and to receive a full refund. To exercise this right, the Client must notify Mergemega in writing within the 5-business-day period. Refunds will be processed within 15 (fifteen) business days of receipt of the cancellation notice, as required by law.
              </p>
              <p>
                <strong>13.3 Subsequent Months:</strong> From the second month onwards, if the Client provides 30 (thirty) calendar days' written notice of cancellation, no further fees will be charged after the notice period expires. No refunds are provided for any month already paid in full, as the services for that month have already been made available.
              </p>
              <p>
                <strong>13.4 Service Failure Refunds:</strong> If Mergemega fails to make the Platform available or deliver the agreed Services for a continuous period exceeding 5 (five) business days in any given month (excluding force majeure events), the Client is entitled to a pro-rata refund for the affected days upon written request.
              </p>
              <p>
                <strong>13.5 No Refund for Dissatisfaction with Leads:</strong> No refunds will be issued on the basis that the Client is dissatisfied with the quality, quantity, or conversion rate of leads, given that Mergemega makes no guarantees as to outcomes (see Clause 4).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "D" as PartKey,
      title: "Part D — Privacy Policy",
      subtitle: "How we collect, manage, and protect your records",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">14. Introduction & Scope</h4>
            <p className="text-xs text-gray-500">
              14.1 Mergemega is committed to protecting the privacy and personal information of all individuals whose data it processes. This Privacy Policy explains what information Mergemega collects, how it is used, disclosed, and protected, and what rights data subjects have.
              <br /><br />
              14.2 This Policy applies to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
              <li>All Clients and their authorised representatives who use the SignalMerge Platform;</li>
              <li>Social media users whose publicly available intent signals are processed by the Platform;</li>
              <li>Any other individual whose personal information comes into Mergemega's possession in connection with its services.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">15. Information Mergemega Collects</h4>
            <div className="space-y-3 text-xs text-gray-500">
              <p><strong>15.1 Client Information:</strong> When onboarding, Mergemega collects the Client's business name, contact details, email address, billing information, and details about the Client's target audience and industry.</p>
              <p><strong>15.2 Platform Usage Data:</strong> Mergemega collects information about how the Client uses the Platform, including login activity, features accessed, searches conducted, and lead signals viewed.</p>
              <p><strong>15.3 Social Media Intent Data:</strong> The Platform collects publicly available social media posts, comments, and interactions that constitute intent signals. This data is sourced from publicly accessible areas of platforms such as TikTok and Instagram. Mergemega does not access private messages or non-public data.</p>
              <p><strong>15.4 Third-Party Data:</strong> Where the Client integrates third-party tools (e.g., Jotform, CRM systems), data may be exchanged with those tools in accordance with those tools' own privacy policies.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 font-mono">16. How Mergemega Uses Personal Information</h4>
            <p className="mb-2 text-xs">16.1 Mergemega uses personal information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
              <li>To provide, configure, and improve the SignalMerge Platform and its features;</li>
              <li>To deliver lead signals and reports to the Client;</li>
              <li>To process payments and manage billing;</li>
              <li>To communicate with Clients about their accounts, service updates, and support;</li>
              <li>To train, develop, and improve Mergemega's artificial intelligence models and machine learning algorithms;</li>
              <li>To analyse platform usage and improve the user experience;</li>
              <li>To comply with legal obligations;</li>
              <li>To share data with authorised third-party service providers and API partners who assist in delivering the Services.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">18. Data Retention & Subject Rights</h4>
            <p className="text-xs text-gray-500 mb-2">
              18.1 Mergemega retains personal information only for as long as necessary to fulfil the purposes for which it was collected, including legal, tax, and accounting requirements.
              <br /><br />
              18.2 Client account data is retained for a minimum of 5 (five) years from the date of last transaction for tax and regulatory compliance purposes.
            </p>
            <h5 className="font-extrabold text-xs text-gray-900 mt-4 mb-2">19. Data Subject Rights</h5>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
              <li>Right to access: to request confirmation of what personal information Mergemega holds about them;</li>
              <li>Right to correction: to request that inaccurate information be corrected;</li>
              <li>Right to deletion: to request deletion of personal information, subject to legal retention obligations;</li>
              <li>Right to object: to object to processing in certain circumstances;</li>
              <li>Right to withdraw consent: where processing is based on consent, to withdraw it at any time (without affecting prior processing);</li>
              <li>Right to lodge a complaint with South Africa's Information Regulator (www.inforegulator.org.za).</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      key: "E" as PartKey,
      title: "Part E — Data Protection Policy",
      subtitle: "Frameworks, processing principles, safety measures, and AI disclosure",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
            <h4 className="text-xs font-black text-orange-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-primary" />
              22. AI Training & Data Use Disclosure
            </h4>
            <p className="text-xs text-orange-900 font-semibold leading-relaxed">
              <strong>EXPLICIT DISCLOSURE:</strong> Personal information and social media intent signal data processed through the SignalMerge Platform may be used to train, develop, validate, and improve Mergemega's proprietary artificial intelligence models and related algorithms. This includes behavioural patterns, search intent signals, and engagement data. Where possible, data used for AI training will be anonymised or pseudonymised. By accepting this Agreement, the Client expressly consents to this use of data.
            </p>
            <p className="text-[11px] text-orange-850 mt-2">
              22.1 Mergemega does not use special personal information (health, religious beliefs, biometric data, sexual orientation) for AI training.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">20. Compliance Framework</h4>
            <div className="space-y-3">
              {[
                { r: "South Africa", d: "Protection of Personal Information Act (POPIA), No. 4 of 2013; Consumer Protection Act (CPA); Electronic Communications and Transactions Act (ECT Act)." },
                { r: "European Union", d: "General Data Protection Regulation (GDPR) 2016/679 — where EU/EEA data subjects are involved." },
                { r: "California (USA)", d: "California Consumer Privacy Act (CCPA) and CPRA — where California residents' data is processed." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                  <span className="font-extrabold text-gray-900 min-w-[120px]">{item.r}</span>
                  <span className="text-gray-500">{item.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">21. Data Processing Principles</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-gray-500">
              <li><strong>Lawfulness, fairness, and transparency:</strong> processed on a lawful basis where subjects are informed;</li>
              <li><strong>Purpose limitation:</strong> collected for specified, explicit, and legitimate purposes;</li>
              <li><strong>Data minimisation:</strong> only data that is strictly necessary for the purpose is collected;</li>
              <li><strong>Accuracy:</strong> reasonable steps are taken to ensure data is updated;</li>
              <li><strong>Storage limitation:</strong> data is kept no longer than necessary;</li>
              <li><strong>Integrity and confidentiality:</strong> secure barriers are implemented to safeguard data.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">23. Security Measures</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
              <li>Encryption of data in transit and at rest where reasonably practicable;</li>
              <li>Access controls limiting employee access to personal information on a need-to-know basis;</li>
              <li>Regular security assessments and vulnerability reviews;</li>
              <li>Contractual data protection obligations imposed on all third-party processors.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      key: "F" as PartKey,
      title: "Part F — Dispute Resolution",
      subtitle: "Negotiation procedures, mediation channels, and arbitration rules",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">25. Dispute Resolution Procedure</h4>
            <p className="mb-4 text-xs">
              25.1 The parties commit to resolving any dispute arising from or in connection with this Agreement in a fair, efficient, and cost-effective manner, following the steps set out below in sequence.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Step 1 — Direct Negotiation</span>
                <p className="text-xs text-gray-600">
                  Either party wishing to raise a dispute must notify the other in writing, clearly describing the nature of the dispute and the remedy sought. The parties must, within 10 (ten) business days of such notice, meet (in person, by video call, or by telephone) and attempt in good faith to resolve the dispute.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Step 2 — Mediation</span>
                <p className="text-xs text-gray-600">
                  If the dispute is not resolved within 15 (fifteen) business days of the written notice, either party may refer it to mediation. A mediator shall be agreed upon jointly, or failing agreement, appointed by the Arbitration Foundation of Southern Africa (AFSA) or the Association of Arbitrators. Costs are shared equally.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Step 3 — Arbitration</span>
                <p className="text-xs text-gray-600">
                  If mediation fails, the dispute shall be finally resolved by binding arbitration under the AFSA Expedited Rules. It will be conducted in the English language, in Gauteng, South Africa, before a single arbitrator in accordance with the Arbitration Act, No. 42 of 1965.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">26. Governing Law & Jurisdiction</h4>
            <p className="text-xs text-gray-500">
              26.1 This Service Agreement is governed by and shall be construed in accordance with the laws of the Republic of South Africa.
              <br /><br />
              26.2 Subject to the dispute resolution procedures above, each party submits to the non-exclusive jurisdiction of the High Court of South Africa, Gauteng Division.
            </p>
          </div>
        </div>
      )
    },
    {
      key: "G" as PartKey,
      title: "Part G — General Provisions",
      subtitle: "Server rules, amendments, relationship and official contact directories",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">27. Entire Agreement & Amendments</h4>
            <p className="text-xs text-gray-500">
              27.1 This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior discussions, representations, or agreements whether written or oral.
              <br /><br />
              28.1 Mergemega may amend this Agreement at any time by providing 30 (thirty) days' prior written notice. Continued use of the platform after notices constitutes active consent.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">31. Official Contact & Notices</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-1.5 font-bold">
                <span className="text-gray-400">Company Name</span>
                <span className="text-gray-800">Mergemega (Pty) Ltd</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5 font-bold">
                <span className="text-gray-400">Registration Number</span>
                <span className="text-gray-800">K2021779747</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5 font-bold">
                <span className="text-gray-400">Headquarters Support / Notice Email</span>
                <span className="text-primary">peter@mergemega.com</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">Registered Information Officer</span>
                <span className="text-gray-800">Mr. Mkhize</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2">
            <p><strong>29. Severability:</strong> If any provision is found unlawful or unenforceable, it is severed and the rest remains fully enforceable.</p>
            <p><strong>32. Relationship:</strong> Independent contractors. No employment, joint venture, or agency relationship created.</p>
            <p><strong>33. Assignment:</strong> Client cannot transfer obligations without written consent. Mergemega reserves rights to assign to successors.</p>
          </div>
        </div>
      )
    },
    {
      key: "H" as PartKey,
      title: "Part H — Signature & Execution",
      subtitle: "Acceptance criteria, electronic signatures, and validation stamp",
      content: (
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed text-center py-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-200">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-lg font-black text-gray-950 uppercase tracking-wider">34. Electronic Signature & Consent</h4>
          <p className="max-w-md mx-auto text-xs text-gray-500 leading-relaxed">
            In accordance with section 13 of South Africa's ECT Act, this Agreement is concluded electronically. By clicking 
            <strong className="text-gray-700"> "Complete Audit & Verify Email"</strong>, making subscription payments, 
            or using the SignalMerge platform, the Client explicitly executes and consents to all binding terms contained in Parts A through H.
          </p>

          <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 p-6 rounded-2xl text-left mt-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Verification Stamp</span>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">Ready to execute</span>
            </div>
            <div className="space-y-2 text-[11px] font-bold text-gray-500">
              <div className="flex justify-between">
                <span>Agreement Authority</span>
                <span className="text-gray-800 font-mono">Mergemega Global Audit Office</span>
              </div>
              <div className="flex justify-between">
                <span>Certification Code</span>
                <span className="text-gray-800 font-mono">ECT-SEC-13-K2021779747</span>
              </div>
              <div className="flex justify-between">
                <span>Date Effective</span>
                <span className="text-gray-800 font-mono">12 May 2026</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activePart = parts.find(p => p.key === activeTab) || parts[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">Mergemega (Pty) Ltd</h3>
                  <span className="text-[9px] font-black text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-md">REG: K2021779747</span>
                </div>
                <h4 className="text-xs font-bold text-gray-500">SignalMerge Client Service Agreement & Policies</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                title="Print Document"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-gray-950 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-72 border-r border-gray-100 bg-gray-50/50 p-4 overflow-y-auto hidden md:block select-none">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block px-3 mb-4">Table of Contents</span>
              <nav className="space-y-1">
                {parts.map(part => (
                  <button
                    key={part.key}
                    onClick={() => setActiveTab(part.key)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between font-bold text-xs ${
                      activeTab === part.key 
                        ? "bg-white text-primary shadow-sm border border-gray-100 font-extrabold" 
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span>{part.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === part.key ? "text-primary translate-x-0.5" : "text-gray-300"}`} />
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-orange-50 border border-orange-100/50 rounded-2xl text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                <span className="text-[10px] font-black text-orange-950 uppercase block">Effective Date</span>
                <span className="text-[10px] text-orange-800 font-bold block mt-0.5">12 May 2026</span>
              </div>
            </aside>

            {/* Document Content View */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Mobile tabs selector representation if on smartphone */}
              <div className="p-3 border-b border-gray-100 overflow-x-auto whitespace-nowrap md:hidden flex gap-1.5 scrollbar-none">
                {parts.map(part => (
                  <button
                    key={part.key}
                    onClick={() => setActiveTab(part.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all flex-shrink-0 ${
                      activeTab === part.key 
                        ? "bg-primary text-white font-black" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {part.key}
                  </button>
                ))}
              </div>

              {/* Title Header of Current Section */}
              <div className="p-6 pb-2 border-b border-gray-50 flex-shrink-0">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Section {activePart.key}</span>
                <h3 className="text-xl font-black text-[#111] mt-0.5 leading-tight">{activePart.title}</h3>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wide">{activePart.subtitle}</p>
              </div>

              {/* Viewport Box (Scrollable legal paragraphs) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {activePart.content}
              </div>
            </main>
          </div>

          {/* Footer - Lock and Exit buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 rounded-b-[2.5rem]">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Full compliance standards for POPIA, CPA & GDPR.</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onClose}
                className="rounded-xl px-6 py-2.5 bg-[#111] hover:bg-black text-white font-black uppercase text-xs tracking-wider shadow-sm flex items-center gap-2 h-11"
              >
                Close Terms Agreement
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
