import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center py-12">
        {/* 404 with Cat Illustration */}
        <div className="relative mb-8 w-full flex justify-center">
          <div className="text-9xl font-black text-black select-none">
            404
          </div>
          
          {/* Cat Illustration */}
          {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
            <Image
              src="/images/image.png"
              alt="Cat playing with yarn and planat"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div> */}
        </div>

        {/* Content */}
        <div className="text-center mt-12">
          <h1 className="text-4xl font-bold text-black mb-3">
            Page Not Found 
            {/* <span className="text-4xl">⚠️</span> */}
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            We couldn't find the page you are looking for
          </p>

          {/* Button */}
          <Link href="/">
            <button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200">
              Back to home page
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
