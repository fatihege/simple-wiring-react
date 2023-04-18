import Head from 'next/head'

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
            </div>
        </>
    )
}
