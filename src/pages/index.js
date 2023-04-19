import Head from 'next/head'
import Components from '@/components/components'
import Simulation from '@/components/simulation'
import styles from '@/styles/Home.module.sass'

export default function Home() {
    return (
        <>
            <Head>
                <title>React Arduino Simulator</title>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <div className={styles.container}>
                <h1>
                    React Arduino Simulator
                </h1>
                <p>
                    A simple simulator for Arduino projects made with React.
                </p>
                <p style={{fontSize: '.9rem', marginTop: '.5rem', color: '#5b5b5b', maxWidth: '800px'}}>
                    Click to draw a line, right click to cancel the line, drag the joints to move the line, double click
                    line to create joint and press delete on the joint to delete the joint, press the delete key to
                    remove the line, and press the escape key to deselect the component.
                </p>
                <Components/>
                <Simulation/>
            </div>
        </>
    )
}
