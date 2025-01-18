import React from 'react'

const Footer = () => {
  return (
    <div className='flex flex-col my-5 '>
        <div className='mx-auto text-center'>
        <div>
           <p className='poppins-medium text-xs'>©Marco Lescano Barbero Profesional, Todos los derechos reservados</p> 
        </div>
       <div className='mt-3'>
       <a class="text-transparent text-sm text-center poppins-bold my-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text" href="https://jeremiasgonzalez.vercel.app/" target="_blank">Powered by Jeremias Gonzalez</a>
       </div>
       </div>
    </div>
  )
}

export default Footer