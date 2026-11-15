
import React from 'react'

interface Params {
  gender: string;
}
const page = async ({ params }: { params: Promise<Params> }) => {
  const pathname = await params;
  console.log()
  return (
    <div>{pathname.gender.toUpperCase()}</div>
  )
}

export default page