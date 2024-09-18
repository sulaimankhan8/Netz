'use client'

import Head from 'next/head'
import NewtonBackwardInterpolations from "../algorithems/algorithems.newton-backward-interpolations";
import Link from 'next/link';

export default function NewtonBackwardInterpolation(){

    return(
    <>

        <section className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">Newton Backward Interpolation Method</h1>
        <p className="text-base " >Newton Backward Interpolation is used to estimate the value of a function at a given point when the data points are tabulated at equal intervals. This method is particularly useful when you want to interpolate a value near the end of the data set. It utilizes backward differences to form the interpolation polynomial.<br></br><br></br>

        The formula for Newton Backward Interpolation is:</p>

        <div className=" text-lg font-script"></div>


        </section>


        <section></section>
        <section></section>



        <section>
            <NewtonBackwardInterpolations/>
        </section>



    </>
        
    );
}