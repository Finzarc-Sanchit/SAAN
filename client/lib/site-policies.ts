/**
 * Policy and information page copy sourced from saanlabel.com
 * (return-exchange, shipping, size-guide, privacy-policy, terms-condition).
 */

export type { SizeChart, SizeChartColumn, SizeChartRow } from '@/lib/size-guide';
export { SIZE_GUIDE_PAGE } from '@/lib/size-guide';

export type PolicyParagraph = { type: 'paragraph'; text: string };
export type PolicyList = { type: 'list'; items: string[] };
export type PolicySubsection = {
  type: 'subsection';
  title: string;
  blocks: Array<PolicyParagraph | PolicyList>;
};
export type PolicySection = {
  title?: string;
  blocks: Array<PolicyParagraph | PolicyList | PolicySubsection>;
};

export type PolicyPageContent = {
  title: string;
  description: string;
  sections: PolicySection[];
};

export const RETURN_EXCHANGE_POLICY: PolicyPageContent = {
  title: 'Return & Exchange Policy',
  description:
    'How returns and exchanges work at SAAN — timelines, eligibility, and store credit.',
  sections: [
    {
      blocks: [
        {
          type: 'list',
          items: [
            'At SAAN, we take pride in delivering thoughtfully curated pieces with exceptional attention to detail.',
            'We accept returns and exchanges for eligible items within 7 days of delivery, provided the products are unused, unworn, and returned in their original condition.',
            'All approved returns are issued solely as store credit for future use on our website.',
          ],
        },
      ],
    },
    {
      title: 'Important information',
      blocks: [
        {
          type: 'list',
          items: [
            'Refunds are not provided.',
            'Customized or exclusive styles are not eligible for return or exchange.',
            'Orders are non-cancellable after 24 hours of confirmation.',
          ],
        },
      ],
    },
  ],
};

export const SHIPPING_POLICY: PolicyPageContent = {
  title: 'Shipping Policy',
  description: 'Delivery timelines, domestic and international shipping, and tracking.',
  sections: [
    {
      title: 'Shipping & delivery',
      blocks: [
        {
          type: 'list',
          items: [
            'At SAAN, each order is thoughtfully prepared, carefully packaged, and dispatched with exceptional attention to detail to ensure a seamless premium shopping experience.',
            'We offer shipping across India on all orders. Domestic deliveries are typically completed within 5–7 business days after dispatch, depending on the delivery location.',
            'For our international clientele, shipping charges are automatically calculated at checkout based on the parcel weight and destination country. International delivery timelines generally range between 7–14 business days; however, timelines may vary depending on customs clearance and regional courier operations.',
            'Once your order is dispatched, tracking details will be shared via email or SMS for a smooth delivery experience.',
          ],
        },
      ],
    },
    {
      title: 'Important information',
      blocks: [
        {
          type: 'list',
          items: [
            'Customers are responsible for any customs duties, import taxes, or additional charges applicable in their respective country.',
            'Delivery timelines may slightly extend during festive seasons, collection launches, or unforeseen logistical circumstances.',
            'SAAN is not responsible for delays caused by customs procedures or courier partners once the order has been dispatched.',
            'Customers are requested to provide complete and accurate shipping information while placing the order.',
          ],
        },
      ],
    },
  ],
};

export const PRIVACY_POLICY: PolicyPageContent = {
  title: 'Privacy Policy',
  description:
    'How SAAN collects, uses, and discloses personal information when you visit or purchase from our website.',
  sections: [
    {
      blocks: [
        {
          type: 'paragraph',
          text: 'This Privacy Policy describes how SAAN collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.',
        },
      ],
    },
    {
      title: 'Collecting personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual as “Personal Information”.',
        },
        {
          type: 'subsection',
          title: 'Device information',
          blocks: [
            {
              type: 'list',
              items: [
                'Examples of Personal Information collected: version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.',
                'Purpose of collection: to load the Site accurately for you, and to perform analytics on Site usage to optimize our Site.',
                'Source of collection: collected automatically when you access our Site using cookies, log files, web beacons, tags, or pixels.',
              ],
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Order information',
          blocks: [
            {
              type: 'list',
              items: [
                'Examples of Personal Information collected: name, billing address, shipping address, payment information, email address, and phone number.',
                'Purpose of collection: to provide products or services to you, process payment, arrange shipping, provide invoices or order confirmations, communicate with you, screen orders for potential risk or fraud, and where aligned with your preferences, provide information or advertising relating to our products or services.',
                'Source of collection: collected from you.',
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Sharing personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you. We may also share Personal Information to comply with applicable laws and regulations, to respond to a lawful request for information, or to otherwise protect our rights.',
        },
      ],
    },
    {
      title: 'Behavioural advertising',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you. This may include analytics tools and advertising partners, sometimes through cookies or similar technologies (which you may consent to, depending on your location).',
        },
      ],
    },
    {
      title: 'Using personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We use your Personal Information to provide our services to you, which includes offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.',
        },
      ],
    },
    {
      title: 'Lawful basis',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you are a resident of the European Economic Area (EEA), we process your personal information under one or more of the following lawful bases: your consent; performance of a contract; compliance with legal obligations; protection of vital interests; a task carried out in the public interest; or our legitimate interests, which do not override your fundamental rights and freedoms.',
        },
      ],
    },
    {
      title: 'Retention',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to erase this information.',
        },
      ],
    },
    {
      title: 'Cookies',
      blocks: [
        {
          type: 'paragraph',
          text: 'A cookie is a small amount of information downloaded to your computer or device when you visit our Site. We use functional, performance, advertising, and social media or content cookies. Cookies help remember preferences and provide information on how people use the website.',
        },
      ],
    },
    {
      title: 'Contact',
      blocks: [
        {
          type: 'paragraph',
          text: 'For questions about this Privacy Policy, contact us at officialsaanlabel@gmail.com or +91 99206 13132.',
        },
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: PolicyPageContent = {
  title: 'Terms & Conditions',
  description: 'Terms of service for using the SAAN website and purchasing from the store.',
  sections: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'paragraph',
          text: 'This website is operated by Saan Label. Throughout the site, the terms “we”, “us” and “our” refer to Saan Label. Saan Label offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.',
        },
        {
          type: 'paragraph',
          text: 'By visiting our site and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.',
        },
        {
          type: 'paragraph',
          text: 'Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.',
        },
        {
          type: 'paragraph',
          text: 'Any new features or tools which are added to the current store shall also be subject to the Terms of Service. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.',
        },
      ],
    },
    {
      title: 'Section 1 — Online store terms',
      blocks: [
        {
          type: 'list',
          items: [
            'By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.',
            'You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).',
            'You must not transmit any worms or viruses or any code of a destructive nature.',
            'A breach or violation of any of the Terms will result in an immediate termination of your Services.',
          ],
        },
      ],
    },
    {
      title: 'Section 2 — General conditions',
      blocks: [
        {
          type: 'list',
          items: [
            'We reserve the right to refuse service to anyone for any reason at any time.',
            'You understand that your content (not including credit card information) may be transferred unencrypted and involve transmissions over various networks and changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.',
            'You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.',
          ],
        },
      ],
    },
    {
      title: 'Section 3 — Accuracy, completeness and timeliness of information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.',
        },
        {
          type: 'paragraph',
          text: 'This site may contain certain historical information. Historical information is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site.',
        },
      ],
    },
    {
      title: 'Section 4 — Modifications to the service and prices',
      blocks: [
        {
          type: 'list',
          items: [
            'Prices for our products are subject to change without notice.',
            'We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.',
            'We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.',
          ],
        },
      ],
    },
    {
      title: 'Section 5 — Products or services',
      blocks: [
        {
          type: 'paragraph',
          text: 'Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return & Exchange Policy.',
        },
        {
          type: 'paragraph',
          text: 'We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor’s display of any color will be accurate.',
        },
        {
          type: 'paragraph',
          text: 'We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.',
        },
      ],
    },
    {
      title: 'Section 6 — Accuracy of billing and account information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or billing address/phone number provided at the time the order was made.',
        },
        {
          type: 'paragraph',
          text: 'You agree to provide current, complete and accurate purchase and account information for all purchases made at our store, and to promptly update your account and other information so that we can complete your transactions and contact you as needed.',
        },
      ],
    },
    {
      title: 'Section 7 — Optional tools',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may provide you with access to third-party tools over which we neither monitor nor have any control nor input. You acknowledge and agree that we provide access to such tools “as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement.',
        },
      ],
    },
    {
      title: 'Section 8 — Third-party links',
      blocks: [
        {
          type: 'paragraph',
          text: 'Certain content, products and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy of third-party materials or websites.',
        },
      ],
    },
    {
      title: 'Section 9 — User comments, feedback and other submissions',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you send creative ideas, suggestions, proposals, plans, or other materials (collectively, “comments”), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are under no obligation to maintain any comments in confidence, to pay compensation for any comments, or to respond to any comments.',
        },
      ],
    },
    {
      title: 'Section 10 — Personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Your submission of personal information through the store is governed by our Privacy Policy.',
        },
      ],
    },
    {
      title: 'Section 11 — Errors, inaccuracies and omissions',
      blocks: [
        {
          type: 'paragraph',
          text: 'Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service is inaccurate at any time without prior notice.',
        },
      ],
    },
    {
      title: 'Section 12 — Prohibited uses',
      blocks: [
        {
          type: 'paragraph',
          text: 'In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content for any unlawful purpose; to solicit others to perform or participate in any unlawful acts; to violate any regulations, rules, laws, or local ordinances; to infringe upon or violate intellectual property rights; to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate; to submit false or misleading information; to upload or transmit viruses or malicious code; to collect or track the personal information of others; to spam, phish, crawl, or scrape; for any obscene or immoral purpose; or to interfere with or circumvent the security features of the Service.',
        },
      ],
    },
    {
      title: 'Section 13 — Disclaimer of warranties; limitation of liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free. You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are provided “as is” and “as available” for your use, without any representation, warranties or conditions of any kind, either express or implied.',
        },
        {
          type: 'paragraph',
          text: 'In no case shall Saan Label, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind arising from your use of any of the service or any products procured using the service.',
        },
      ],
    },
    {
      title: 'Section 14 — Indemnification',
      blocks: [
        {
          type: 'paragraph',
          text: 'You agree to indemnify, defend and hold harmless Saan Label and our affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms of Service or your violation of any law or the rights of a third-party.',
        },
      ],
    },
    {
      title: 'Section 15 — Severability',
      blocks: [
        {
          type: 'paragraph',
          text: 'In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service.',
        },
      ],
    },
    {
      title: 'Section 16 — Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes. These Terms of Service are effective unless and until terminated by either you or us.',
        },
      ],
    },
    {
      title: 'Section 17 — Entire agreement',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitute the entire agreement and understanding between you and us and govern your use of the Service.',
        },
      ],
    },
    {
      title: 'Section 18 — Governing law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.',
        },
      ],
    },
    {
      title: 'Section 19 — Changes to terms of service',
      blocks: [
        {
          type: 'paragraph',
          text: 'You can review the most current version of the Terms of Service at any time on this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.',
        },
      ],
    },
    {
      title: 'Section 20 — Contact information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Questions about the Terms of Service should be sent to us at officialsaanlabel@gmail.com.',
        },
      ],
    },
  ],
};
