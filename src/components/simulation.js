import {createContext, useContext, useEffect, useRef, useState} from 'react'
import {SnappingContext} from '@/pages'
import Wire from '@/components/simulation/wire'
import getMax from '@/utils/get-max'
import styles from '@/styles/Simulation.module.sass'

export const SvgRectContext = createContext(null) // Create a context for the SVG element's rect
export const SelectedComponentContext = createContext(null) // Create a context for the selected component
export const WiresContext = createContext([]) // Create a context for the wires
export const WiringContext = createContext(false) // Create a context for the wire being drawn
export const WireJointsContext = createContext(null) // Create a context for the wire joints

const SNAPPING_DISTANCE = 5 // Distance to snap to a joint

export default function Simulation() {
    const [snapping] = useContext(SnappingContext) // Whether snapping is enabled
    const svgRef = useRef() // Reference to the SVG element
    const [svgRect, _setSvgRect] = useState(null)
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
    const svgRectRef = useRef(svgRect) // Reference to the SVG element's rect
    const wiresRef = useRef(wires) // Reference to the wires array
    const wiringRef = useRef(wiring) // Reference to the current wire
    const selectedComponentRef = useRef(selectedComponent) // Reference to the selected component
    const activeJointRef = useRef(activeJoint) // Reference to the selected component
    const xAxisRef = useRef()
    const yAxisRef = useRef()

    const setSvgRect = value => { // Set the SVG element's rect
        svgRectRef.current = value
        _setSvgRect(value)
    }

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
        setActiveJoint(null)
    }

    const setActiveJoint = value => { // Set the active joint
        activeJointRef.current = value
        _setActiveJoint(value)
    }

    const showAxis = (axis, pos, hide = false) => { // Show the axis
        if (axis === 'x') { // If the axis is the x axis
            if (hide) xAxisRef.current.classList.remove(styles.show) // If hide is true, remove the show class from the x axis
            else {
                xAxisRef.current.style.top = `${pos}px` // Set the top position of the x axis
                xAxisRef.current.classList.add(styles.show) // Add the show class to the x axis
            }
        } else if (axis === 'y') { // If the axis is the y axis
            if (hide) yAxisRef.current.classList.remove(styles.show) // If hide is true, remove the show class from the y axis
            else {
                yAxisRef.current.style.left = `${pos}px` // Set the left position of the y axis
                yAxisRef.current.classList.add(styles.show) // Add the show class to the y axis
            }
        }
    }

    // TODO: Remove this
    let ran = false // Whether the useEffect hook has ran
    useEffect(() => {
        if (ran) return // If the useEffect hook has ran, return
        ran = true // Set ran to true

        const MAX_POINTS = 8 // Maximum number of points in a wire

        const rect = svgRef.current.getBoundingClientRect() // Get the bounding rectangle of the SVG element
        setSvgRect(rect) // Set the SVG element's rect

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

            if (e.button !== 0) return // If the mouse button is not the left mouse button, return

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
                    points: [...wiringRef.current.points, {id: getMax(wiringRef.current.points, 'id') + 1, x, y}]
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
            else if (typeof activeJointRef.current?.id === 'number' && activeJointRef.current.clicked) { // If the active joint is a point in the wire, update the point
                const newWires = wiresRef.current.map(wire => { // Map through the wires array
                    if (wire.id === activeJointRef.current.wire.id) { // If the wire ID matches the wire ID of the active joint, update the position of the joint
                        if (activeJointRef.current.id === wire.start.id) return {...wire, start: {...wire.start, x, y}} // If the joint is the start point of the wire, update the start point
                        else if (activeJointRef.current.id === wire.end.id) return {...wire, end: {...wire.end, x, y}} // If the joint is the end point of the wire, update the end point
                        else { // If the joint is a point in the wire, update the point
                            const pointPos = wire.points.find(point => point.id === activeJointRef.current.id) // Get the position of the point in the points array
                            const newPoints = wire.points.map(point => { // Map through the points array
                                if (point.id === activeJointRef.current.id) { // If the point ID matches the point ID of the active joint, update the position of the point
                                    let newX, newY // New x and y coordinates of the point

                                    if (snapping.current) { // If snapping is enabled
                                        let xSnapId = null // ID of the point to snap to on the x axis
                                        let ySnapId = null // ID of the point to snap to on the y axis

                                        if (xSnapId === null && Math.abs(x - wire.start.x) < SNAPPING_DISTANCE) xSnapId = wire.start.id // If the x coordinate is within the snapping distance of the start point, set the xSnapId to the start point ID
                                        if (ySnapId === null && Math.abs(y - wire.start.y) < SNAPPING_DISTANCE) ySnapId = wire.start.id // If the y coordinate is within the snapping distance of the start point, set the ySnapId to the start point ID

                                        if (xSnapId === null && Math.abs(x - wire.end.x) < SNAPPING_DISTANCE) xSnapId = wire.end.id // If the x coordinate is within the snapping distance of the end point, set the xSnapId to the end point ID
                                        if (ySnapId === null && Math.abs(y - wire.end.y) < SNAPPING_DISTANCE) ySnapId = wire.end.id // If the y coordinate is within the snapping distance of the end point, set the ySnapId to the end point ID

                                        wire.points.map(p => {
                                            if (p.id === pointPos.id) return // If the point ID matches the point ID of the active joint, return (to prevent snapping to itself
                                            if (xSnapId === null && Math.abs(x - p.x) < SNAPPING_DISTANCE) xSnapId = p.id // If the x coordinate is within the snapping distance of a point, set the xSnapId to the point ID
                                            if (ySnapId === null && Math.abs(y - p.y) < SNAPPING_DISTANCE) ySnapId = p.id // If the y coordinate is within the snapping distance of a point, set the ySnapId to the point ID
                                        })

                                        newX = xSnapId ? (xSnapId >= 0 ? wire.points.find(p => p.id === xSnapId).x : xSnapId === -1 ? wire.start.x : xSnapId === -2 ? wire.end.x : x) : x // If the xSnapId is not null, set the x coordinate to the x coordinate of the point to snap to, otherwise set the x coordinate to the x coordinate of the mouse
                                        newY = ySnapId ? (ySnapId >= 0 ? wire.points.find(p => p.id === ySnapId).y : ySnapId === -1 ? wire.start.y : ySnapId === -2 ? wire.end.y : y) : y // If the ySnapId is not null, set the y coordinate to the y coordinate of the point to snap to, otherwise set the y coordinate to the y coordinate of the mouse

                                        if (xSnapId) showAxis('y', newX) // If the xSnapId is not null, show the x axis
                                        else showAxis('y', null, true) // If the xSnapId is null, hide the x axis
                                        if (ySnapId) showAxis('x', newY) // If the ySnapId is not null, show the y axis
                                        else showAxis('x', null, true) // If the ySnapId is null, hide the y axis
                                    } else { // If snapping is disabled
                                        newX = x // Set the x coordinate to the x coordinate of the mouse
                                        newY = y // Set the y coordinate to the y coordinate of the mouse
                                    }

                                    return {...point, x: newX, y: newY} // Return the point with the updated position
                                } // If the point ID matches the point ID of the active joint, update the point
                                return point // If the point ID does not match the point ID of the active joint, return the point
                            })

                            return {...wire, points: newPoints} // Return the wire with the updated points array
                        }
                    }

                    return wire // If the wire ID does not match the wire ID of the active joint, return the wire
                })

                setWires(newWires) // Update the wires array
            }
        })

        svgRef.current.addEventListener('mouseup', () => {
            setActiveJoint({...activeJointRef.current, clicked: false}) // If the mouse is released, set the active joint to null
            showAxis('x', null, true) // Hide the x axis
            showAxis('y', null, true) // Hide the y axis
        })

        svgRef.current.addEventListener('contextmenu', e => { // If the right mouse button is clicked, cancel the wire
            e.preventDefault() // Cancel the event
            if (wiringRef.current.active) setWiring({id: null, active: false, start: null, points: [], end: null}) // If the wire is being drawn, cancel the wire
        })

        svgRef.current.addEventListener('dragstart', e => e.preventDefault()) // If the SVG element is dragged, cancel the event

        window.addEventListener('resize', () => setSvgRect(svgRef.current.getBoundingClientRect())) // If the window is resized, update the SVG element's bounding rectangle
        window.addEventListener('scroll', () => setSvgRect(svgRef.current.getBoundingClientRect())) // If the window is scrolled, update the SVG element's bounding rectangle
        window.addEventListener('wheel', () => setSvgRect(svgRef.current.getBoundingClientRect())) // If the mouse wheel is scrolled, update the SVG element's bounding rectangle
        window.addEventListener('keydown', e => { // If a key is pressed
            if (e.key === 'Delete') { // If the key is the delete key
                if (!selectedComponentRef.current?.elem || selectedComponentRef.current.elem.contains(svgRef.current)) return // If the selected component is the SVG element, return
                if (typeof activeJointRef.current?.id !== 'number') setWires(wiresRef.current.filter(wire => // If the mouse is not over a joint, filter the wires array
                    selectedComponentRef.current.elem && selectedComponentRef.current.id !== wire.id) // If the selected component is not the SVG element and the wire ID does not match the selected component ID, return the wire
                )
                else if (activeJointRef.current?.id >= 0) { // If the mouse is over a joint, filter the wires array
                    wiresRef.current.map((wire, index) => { // Map through the wires array
                        if (wire.id === activeJointRef.current.wire.id && wire.points.find(point => point.id === activeJointRef.current.id)) { // If the wire contains the joint, remove the joint from the wire
                            const newPoints = wire.points.filter(point => point.id !== activeJointRef.current.id) // Filter the points array
                            setWires([...wiresRef.current.slice(0, index), {
                                ...wire,
                                points: newPoints
                            }, ...wiresRef.current.slice(index + 1)]) // Update the wires array
                        }
                    })

                    setActiveJoint(null) // Set the active joint to null
                }
            } else if (e.key === 'Escape') { // If the key is the escape key
                setSelectedComponent({id: -1, elem: svgRef.current}) // Set the selected component to the SVG element
                if (wiringRef.current.active) setWiring({id: null, active: false, start: null, points: [], end: null}) // If the wire is being drawn, cancel the wire
            }
        })
    }, [svgRef])

    return (
        <div className={styles.container}>
            <svg width={1500} height={900} viewBox="0 0 1500 900" xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
                <SvgRectContext.Provider value={[svgRect, setSvgRect]}>
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
                </SvgRectContext.Provider>
            </svg>
            <div className={styles.axes}>
                <div className={styles.x} ref={xAxisRef}></div>
                <div className={styles.y} ref={yAxisRef}></div>
            </div>
        </div>
    )
}