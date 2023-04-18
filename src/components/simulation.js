import {createContext, useEffect, useRef, useState} from 'react'
import Wire from '@/components/simulation/wire'
import styles from '@/styles/Simulation.module.sass'

export const SelectedComponentContext = createContext(null) // Create a context for the selected component
export const WiresContext = createContext([]) // Create a context for the wires
export const WiringContext = createContext(false) // Create a context for the wire being drawn
export const WireJointsContext = createContext(null) // Create a context for the wire joints

export default function Simulation() {
    const svgRef = useRef() // Reference to the SVG element
    const [wires, _setWires] = useState([]) // Array of wires
    const [wiring, _setWiring] = useState({ // Current wire that being drawn
        id: null, // ID of the wire
        active: false, // Whether the wire is being drawn
        start: null, // Start point of the wire
        points: [], // Array of points in the wire
        end: null, // End point of the wire
    })
    const [selectedComponent, _setSelectedComponent] = useState(null) // Currently selected component
    const [activeJoint, _setActiveJoint] = useState(null) // Currently active joint
    const wiresRef = useRef(wires) // Reference to the wires array
    const wiringRef = useRef(wiring) // Reference to the current wire
    const selectedComponentRef = useRef(selectedComponent) // Reference to the selected component
    const activeJointRef = useRef(activeJoint) // Reference to the selected component
    let ran = false // Whether the useEffect hook has ran

    const setWires = value => { // Set the wires array
        wiresRef.current = value
        _setWires(value)
    }

    const setWiring = value => { // Set the current wire
        wiringRef.current = value
        _setWiring(value)
    }

    const setSelectedComponent = value => { // Set the selected component
        selectedComponentRef.current = value
        _setSelectedComponent(value)
    }

    const setActiveJoint = value => { // Set the active joint
        activeJointRef.current = value
        _setActiveJoint(value)
    }

    useEffect(() => {
        if (ran) return // If the useEffect hook has ran, return
        ran = true // Set ran to true

        const MAX_POINTS = 8 // Maximum number of points in a wire

        svgRef.current.addEventListener('mousedown', e => {
            if (e.target.contains(svgRef.current)) setSelectedComponent({ // If the SVG element is clicked, set the selected component to the SVG element
                id: -1,
                elem: svgRef.current
            })
            // If the mouse is over a joint, or the SVG element is not clicked, or the selected component is not the SVG element, return
            if (!wiringRef.current.active && (activeJointRef.current || !e.target.contains(svgRef.current) || selectedComponentRef.current.elem && !selectedComponentRef.current.elem.contains(svgRef.current))) return

            const rect = svgRef.current.getBoundingClientRect() // Get the bounding rectangle of the SVG element
            const x = e.clientX - rect.left // Get the x coordinate of the click
            const y = e.clientY - rect.top // Get the y coordinate of the click

            if (!wiringRef.current.active) setWiring({ // If the wire is not being drawn, start drawing the wire
                ...wiringRef.current,
                id: Date.now(),
                active: true,
                start: {id: -1, x, y},
                end: {id: -2, x, y},
            })
            else { // If the wire is being drawn, add a point to the wire
                if (wiringRef.current.points.length < MAX_POINTS) setWiring({ // If the wire has not reached the maximum number of points, add a point to the wire
                    ...wiringRef.current,
                    points: [...wiringRef.current.points, {id: wiringRef.current.points.length, x, y}]
                })
                else { // If the wire has reached the maximum number of points, end the wire
                    setWiring({...wiringRef.current, end: {...wiringRef.current.end, x, y}, active: false}) // Set the end point of the wire
                    setWires([...wiresRef.current, wiringRef.current]) // Add the wire to the wires array
                    setWiring({id: null, active: false, start: null, points: [], end: null}) // Reset the wiring state
                }
            }
        }, true)

        svgRef.current.addEventListener('mousemove', e => {
            const rect = svgRef.current.getBoundingClientRect() // Get the bounding rectangle of the SVG element
            const x = e.clientX - rect.left // Get the x coordinate of the mouse
            const y = e.clientY - rect.top // Get the y coordinate of the mouse

            if (wiringRef.current.active) setWiring({...wiringRef.current, end: {...wiringRef.current.end, x, y}}) // If the wire is being drawn, update the end point of the wire
            else if (activeJointRef.current) { // If the wire is not being drawn, but the mouse is over a joint, update the position of the joint
                const newWires = wiresRef.current.map(wire => { // Map through the wires array
                    if (wire.id === activeJointRef.current.wire.id) { // If the wire ID matches the wire ID of the active joint, update the position of the joint
                        if (activeJointRef.current.id === wire.start.id) return {...wire, start: {...wire.start, x, y}} // If the joint is the start point of the wire, update the start point
                        else if (activeJointRef.current.id === wire.end.id) return {...wire, end: {...wire.end, x, y}} // If the joint is the end point of the wire, update the end point
                        else { // If the joint is a point in the wire, update the point
                            const newPoints = wire.points.map(point => { // Map through the points array
                                if (point.id === activeJointRef.current.id) return {...point, x, y} // If the point ID matches the point ID of the active joint, update the point
                                return point // If the point ID does not match the point ID of the active joint, return the point
                            })

                            return {...wire, points: newPoints} // Return the wire with the updated points array
                        }
                    }

                    return wire // If the wire ID does not match the wire ID of the active joint, return the wire
                })

                setWires(newWires)
            }
        })

        svgRef.current.addEventListener('mouseup', () => {
            setActiveJoint(null) // If the mouse is released, set the active joint to null
        })

        svgRef.current.addEventListener('contextmenu', e => { // If the right mouse button is clicked, cancel the wire
            e.preventDefault() // Cancel the event
            if (wiringRef.current.active) setWiring({id: null, active: false, start: null, points: [], end: null}) // If the wire is being drawn, cancel the wire
        })

        svgRef.current.addEventListener('dragstart', e => e.preventDefault()) // If the SVG element is dragged, cancel the event

        window.addEventListener('keydown', e => { // If a key is pressed
            if (e.key === 'Delete') { // If the key is the delete key
                if (selectedComponentRef.current.elem && !selectedComponentRef.current.elem.contains(svgRef.current)) // If the selected component is not the SVG element
                    setWires(wiresRef.current.filter(wire => // Filter the wires array
                        selectedComponentRef.current.elem && selectedComponentRef.current.id !== wire.id) // If the selected component is not the SVG element and the wire ID does not match the selected component ID, return the wire
                    )
            } else if (e.key === 'Escape') { // If the key is the escape key
                setSelectedComponent({id: -1, elem: svgRef.current}) // Set the selected component to the SVG element
                if (wiringRef.current.active) setWiring({id: null, active: false, start: null, points: [], end: null}) // If the wire is being drawn, cancel the wire
            }
        })
    }, [svgRef])

    return (
        <div className={styles.container}>
            <svg width={1500} height={900} viewBox="0 0 1500 900" xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
                <SelectedComponentContext.Provider value={[selectedComponent, setSelectedComponent]}>
                    <WiresContext.Provider value={[wires, setWires]}>
                        <WiringContext.Provider value={[wiring, setWiring]}>
                            <WireJointsContext.Provider value={[activeJoint, setActiveJoint]}>
                                {wires.map((wire, i) => (
                                    <Wire key={wire.id} wire={wire}/>
                                ))}
                                {wiring.active && (<Wire wire={wiring}/>)}
                            </WireJointsContext.Provider>
                        </WiringContext.Provider>
                    </WiresContext.Provider>
                </SelectedComponentContext.Provider>
            </svg>
        </div>
    )
}