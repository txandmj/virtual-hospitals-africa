export function CallToAction() {
  return (
    <>
      <div className='bg-slate-50 rounded-lg p-6 sm:p-8 border border-slate-100'>
        <h2 className='font-serif text-2xl font-bold text-slate-900'>Stay connected with Virtual Hospitals Africa</h2>
        <p className='text-slate-600 mt-2 leading-relaxed'>
          Get updates on our work.
        </p>
        <div className='mt-6'>
          <a
            href='/mailing-list'
            className='inline-flex items-center justify-center rounded-lg px-4 py-2 text-white font-medium bg-[#473fce] hover:bg-[#3a33a8] transition-colors'
          >
            Sign up for our mailing list
          </a>
        </div>
      </div>

      <a
        href='/tutorial'
        className='group mt-6 block rounded-lg overflow-hidden border border-slate-200 hover:border-[#473fce] transition-colors'
      >
        <div className='overflow-hidden bg-slate-100'>
          <img
            src='/images/ogimage-tutorial.png'
            alt='Try the tutorial'
            className='w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]'
          />
        </div>
        <div className='p-4 sm:p-6 flex items-center justify-between gap-4'>
          <div>
            <h2 className='font-serif text-2xl font-bold text-slate-900 group-hover:text-[#473fce] transition-colors'>Try the tutorial</h2>
            <p className='text-slate-600 mt-1 leading-relaxed'>See the platform in action.</p>
          </div>
          <span className='text-[#473fce] font-medium whitespace-nowrap'>Get started →</span>
        </div>
      </a>
    </>
  )
}
