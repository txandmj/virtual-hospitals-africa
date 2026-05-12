type Faq = {
  question: string
  answer: preact.ComponentChildren
}

const CONTACT_EMAIL = 'info@virtualhospitalsafrica.org'
const PARTNERSHIPS_EMAIL = 'partnerships@virtualhospitalsafrica.org'

const faqs: Faq[] = [
  {
    question: 'I have a question, comment, or concern about my donation. Who can I contact?',
    answer: (
      <p>
        Please feel free to send an email to{' '}
        <a href={`mailto:${PARTNERSHIPS_EMAIL}`} class='text-indigo-700 underline'>
          {PARTNERSHIPS_EMAIL}
        </a>{' '}
        with any questions, comments, or concerns and a member of our team will be in touch.
      </p>
    ),
  },
  {
    question: 'Is my donation tax-deductible?',
    answer: (
      <p>
        Virtual Hospitals Africa is a registered South African non-profit. Where applicable, donations from South African taxpayers may qualify for a Section
        18A certificate. Donors based outside South Africa should consult a tax advisor regarding deductibility in their jurisdiction — contact us at{' '}
        <a href={`mailto:${PARTNERSHIPS_EMAIL}`} class='text-indigo-700 underline'>
          {PARTNERSHIPS_EMAIL}
        </a>{' '}
        if you need supporting documentation.
      </p>
    ),
  },
  {
    question: 'Will I get a receipt?',
    answer: (
      <p>
        Yes. You will receive a receipt via email immediately following your online donation, and a signed acknowledgement letter for your records on request.
      </p>
    ),
  },
  {
    question: 'Is my online donation secure?',
    answer: (
      <p>
        Yes. Online donations are processed through Donorbox, which uses industry-standard SSL encryption and PCI-compliant payment providers to protect your
        information.
      </p>
    ),
  },
  {
    question: 'Can I send an EFT, a gift of stock, or a wire transfer?',
    answer: (
      <>
        <p>
          Yes — and EFTs and wire transfers are a great way to ensure the entirety of your gift reaches our frontline programs without payment processing fees.
          Please email{' '}
          <a
            href={`mailto:${PARTNERSHIPS_EMAIL}`}
            class='text-indigo-700 underline'
          >
            {PARTNERSHIPS_EMAIL}
          </a>{' '}
          and we will share current banking details and instructions for gifts of stock.
        </p>
        <p class='mt-3'>
          <strong>Virtual Hospitals Africa</strong>
          <br />
          13 Gemini Street, Sterpark
          <br />
          Polokwane, Limpopo 0699
          <br />
          South Africa
        </p>
      </>
    ),
  },
  {
    question: 'What are the benefits of becoming a monthly donor?',
    answer: (
      <p>
        We're so glad you asked. Our monthly donors are the bedrock of our work. Reliable, recurring funding lets us commit to long-term deployments at rural
        clinics — including connectivity, devices, solar backup, and ongoing training — instead of pausing work between campaigns.
      </p>
    ),
  },
  {
    question: 'If I make a monthly donation, will I be able to suspend it or change the amount?',
    answer: (
      <p>
        Yes. You can change or pause your recurring donation at any time through your Donorbox account, or by emailing{' '}
        <a
          href={`mailto:${PARTNERSHIPS_EMAIL}`}
          class='text-indigo-700 underline'
        >
          {PARTNERSHIPS_EMAIL}
        </a>{' '}
        and we will promptly process the requested changes.
      </p>
    ),
  },
  {
    question: 'Can I have my employer match my gift?',
    answer: (
      <p>
        Many employers will match their employees' charitable contributions, often doubling the impact of your gift. We encourage you to check with your Human
        Resources department. If your employer needs documentation to process a match, email{' '}
        <a
          href={`mailto:${PARTNERSHIPS_EMAIL}`}
          class='text-indigo-700 underline'
        >
          {PARTNERSHIPS_EMAIL}
        </a>{' '}
        and we will provide it.
      </p>
    ),
  },
  {
    question: 'What is Virtual Hospitals Africa\u2019s gift acceptance policy?',
    answer: (
      <>
        <p>
          Virtual Hospitals Africa solicits and accepts gifts that are consistent with its mission of strengthening primary care at the frontline. We evaluate
          every gift for alignment with our mission and reserve the right to decline gifts that present a conflict of interest with our work to provide
          equitable healthcare.
        </p>
        <p class='mt-3'>
          Donations are generally accepted from individuals, partnerships, corporations, foundations, government agencies, and other entities, subject to the
          following limitations:
        </p>
        <ul class='mt-3 list-disc space-y-2 pl-6'>
          <li>
            We do not accept gifts from entities with a history of human rights violations, entities involved in the production or sale of arms, or gifts of
            property or stock where donor rights of ownership cannot be confirmed.
          </li>
          <li>
            Gifts of real property, personal property, or non-stock securities may only be accepted upon approval of our leadership team.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: 'Does Virtual Hospitals Africa accept donations of devices or medical equipment?',
    answer: (
      <p>
        Yes — in-kind donations of ruggedized tablets, solar backup hardware, and clinic-appropriate medical devices are welcome. Because we deploy to rural
        clinics with specific connectivity and power constraints, we ask that any in-kind donation be discussed with our operations team first to confirm fit
        and a clear use. For consumables with an expiration date, please ensure at least one year of shelf life remains. For more information, contact{' '}
        <a
          href={`mailto:${PARTNERSHIPS_EMAIL}`}
          class='text-indigo-700 underline'
        >
          {PARTNERSHIPS_EMAIL}
        </a>.
      </p>
    ),
  },
  {
    question: 'What if my organisation is interested in partnering with yours?',
    answer: (
      <p>
        Wonderful. Visit our{' '}
        <a href='/partner' class='text-indigo-700 underline'>
          partner page
        </a>{' '}
        or email{' '}
        <a
          href={`mailto:${PARTNERSHIPS_EMAIL}`}
          class='text-indigo-700 underline'
        >
          {PARTNERSHIPS_EMAIL}
        </a>{' '}
        and a member of our team will follow up with you to explore how we can work together.
      </p>
    ),
  },
  {
    question: 'How else can I support Virtual Hospitals Africa\u2019s work?',
    answer: (
      <>
        <p>
          We can't do this work alone. We rely on a community of partners and supporters to bring specialist-grade care to the frontline:
        </p>
        <ol class='mt-3 list-decimal space-y-2 pl-6'>
          <li>
            Dedicate your birthday, wedding, or fun run to ensuring every rural clinic is within reach of a virtual specialist. Let us know about your
            fundraiser at{' '}
            <a
              href={`mailto:${PARTNERSHIPS_EMAIL}`}
              class='text-indigo-700 underline'
            >
              {PARTNERSHIPS_EMAIL}
            </a>{' '}
            for the chance to be featured.
          </li>
          <li>
            Ask your employer about a matching gift programme — many companies will double or triple your contribution.
          </li>
          <li>
            Share our work with your friends, family, and colleagues. The more clinicians, technologists, and funders who know about Virtual Hospitals Africa,
            the faster the platform reaches the communities that need it.
          </li>
          <li>
            If you are a clinician, software engineer, or researcher interested in contributing your skills, reach out — we collaborate with volunteers on
            focused, time-bounded projects.
          </li>
        </ol>
        <p class='mt-3'>
          Questions? Reach out to{' '}
          <a
            href={`mailto:${PARTNERSHIPS_EMAIL}`}
            class='text-indigo-700 underline'
          >
            {PARTNERSHIPS_EMAIL}
          </a>{' '}
          or{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            class='text-indigo-700 underline'
          >
            {CONTACT_EMAIL}
          </a>{' '}
          to connect with a member of our team.
        </p>
      </>
    ),
  },
]

export default function DonateFaqs() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-4xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            Donor support
          </p>
          <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Frequently asked questions
          </h2>
        </div>

        <div class='mt-12 divide-y divide-gray-200 rounded-2xl ring-1 ring-gray-200 bg-white'>
          {faqs.map((faq, i) => (
            <details
              key={i}
              class='group px-6 py-5 [&_summary::-webkit-details-marker]:hidden'
            >
              <summary class='flex cursor-pointer items-start justify-between gap-4 text-left'>
                <h3 class='text-base font-semibold leading-7 text-gray-900 sm:text-lg'>
                  {faq.question}
                </h3>
                <span
                  aria-hidden='true'
                  class='mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-indigo-50 text-indigo-700 transition-transform group-open:rotate-45'
                >
                  <svg
                    class='h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2.5'
                  >
                    <path
                      stroke-linecap='round'
                      stroke-linejoin='round'
                      d='M12 5v14M5 12h14'
                    />
                  </svg>
                </span>
              </summary>
              <div class='mt-4 space-y-3 text-sm leading-6 text-gray-600 sm:text-base'>
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
