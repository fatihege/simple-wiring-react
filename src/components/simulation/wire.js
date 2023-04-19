import {useContext, useEffect, useRef, useState} from 'react'
import {
    SvgRectContext,
    SelectedComponentContext,
    WiresContext,
    WiringContext,
    WireJointsContext
} from '@/components/simulation'
import getMax from '@/utils/get-max'

const WIRE_COLOR = '#00dc70', // Color of the wire
    WIRE_BORDER_COLOR = '#00a64e', // Color of the wire border
    WIRE_BORDER_WIDTH = 1, // Width of the wire border
    WIRE_SELECTION_COLOR = 'rgba(0,157,255,0.4)', // Color of the wire selection
    WIRE_SELECTION_WIDTH = 6, // Width of the wire selection
    WIRE_WIDTH = 3 // Width of the wire

// Wire joint component
const WireJoint = ({wire, x, y, id}) => {
    const [activeJoint, setActiveJoint] = useContext(WireJointsContext) // Get the active joint
    const jointRef = useRef() // Reference to the joint element

    const handleClick = () =>
        setActiveJoint({id, wire, clicked: true}) // If the joint is already active, set the active joint to null, otherwise set it to the joint

    return (
        <g ref={jointRef} onMouseDown={() => handleClick()}>
            <circle cx={x} cy={y} r={WIRE_WIDTH * 2 + WIRE_BORDER_WIDTH} fill={WIRE_BORDER_COLOR}/>
            <circle cx={x} cy={y} r={WIRE_WIDTH * 2} fill={WIRE_COLOR}/>
            <circle cx={x} cy={y} r={WIRE_WIDTH} fill={activeJoint?.id === id ? '#fff' : WIRE_BORDER_COLOR}/>
        </g>
    )
}

// Wire component
export default function Wire(props) {
    const wire = props.wire // Get the wire
    const [svgRect] = useContext(SvgRectContext) // Get the SVG rect
    const [selectedComponent, setSelectedComponent] = useContext(SelectedComponentContext) // Get the selected component
    const [wires, setWires] = useContext(WiresContext) // Get the wires
    const [wiring] = useContext(WiringContext) // Get the wire being drawn
    const [selected, _setSelected] = useState(false) // Whether the wire is selected
    const [hover, _setHover] = useState(false) // Whether the wire is hovered over
    const selectedRef = useRef(selected) // Reference to the selected state
    const hoverRef = useRef(hover) // Reference to the hover state
    const wireRef = useRef() // Reference to the wire element

    const setSelected = value => { // Set the selected state
        selectedRef.current = value
        _setSelected(value)
    }

    const setHover = value => { // Set the hover state
        hoverRef.current = value
        _setHover(value)
    }

    const handleWireClick = e => { // Handle the wire being clicked
        if (wire.active || wiring.active) return // If the wire is being drawn, return

        e.stopPropagation() // Stop the event from propagating
        setSelected(!selectedRef.current) // Toggle the selected state
        setSelectedComponent(selectedRef.current ? {
            id: wire.id,
            elem: wireRef.current
        } : null) // Set the selected component to the wire element if the wire is selected, otherwise set it to null
    }

    const handleWireHover = state => { // Handle the wire being hovered over
        if (wire.active || wiring.active || (selectedComponent?.id > 0 && selectedComponent.id !== wire.id)) return // If a wire is being drawn or another wire is selected, return
        setHover(state) // Set the hover state
    }

    const handleWireDoubleClick = (e, index) => { // Handle the wire being double clicked
        const newPoints = [...wire.points.slice(0, index), {
            id: getMax(wire.points, 'id') + 1, // Get the maximum ID of the wire points and add 1 (this is the ID of the new point
            x: e.clientX - svgRect.x,
            y: e.clientY - svgRect.y
        }, ...wire.points.slice(index)] // Add a new point to the wire

        setWires(wires.map(w => w.id === wire.id ? {
            ...w,
            points: newPoints,
        } : w))

        setSelected(true) // Set the selected state to true
        setSelectedComponent({id: wire.id, elem: wireRef.current}) // Set the selected component to the wire element
    }

    useEffect(() => { // If the selected component changes, check if the wire contains the selected component
        if (selectedComponent?.elem && wireRef.current.contains(selectedComponent.elem)) setSelected(true) // If the wire contains the selected component, set the selected state to true
        else setSelected(false) // Otherwise, set the selected state to false
    }, [selectedComponent])

    return (
        <>
            <g ref={wireRef}>
                <path
                    d={`M${wire.start.x} ${wire.start.y} ${wire.points.map(point => `L${point.x} ${point.y}`).join(' ')} ${wire.end ? `L${wire.end.x} ${wire.end.y}` : ''}`}
                    stroke={selected || hover ? WIRE_SELECTION_COLOR : 'transparent'}
                    strokeWidth={WIRE_WIDTH + WIRE_BORDER_WIDTH + WIRE_SELECTION_WIDTH} strokeLinejoin="round"
                    strokeLinecap="round" fill="none"/>
                <path
                    d={`M${wire.start.x} ${wire.start.y} ${wire.points.map(point => `L${point.x} ${point.y}`).join(' ')} ${wire.end ? `L${wire.end.x} ${wire.end.y}` : ''}`}
                    stroke={WIRE_BORDER_COLOR} strokeWidth={WIRE_WIDTH + WIRE_BORDER_WIDTH} strokeLinejoin="round"
                    strokeLinecap="round" fill="none"/>
                <path
                    d={`M${wire.start.x} ${wire.start.y} ${wire.points.map(point => `L${point.x} ${point.y}`).join(' ')} ${wire.end ? `L${wire.end.x} ${wire.end.y}` : ''}`}
                    stroke={wire.active ? WIRE_BORDER_COLOR : WIRE_COLOR} strokeWidth={WIRE_WIDTH}
                    strokeLinejoin="round" strokeLinecap="round" fill="none"/>
            </g>
            <g>
                <path
                    d={`M${wire.start.x} ${wire.start.y} ${wire.points.length ? `L${wire.points[0].x} ${wire.points[0].y}` : `L${wire.end.x} ${wire.end.y}`}`}
                    stroke="transparent" strokeWidth={WIRE_WIDTH + WIRE_BORDER_WIDTH + WIRE_SELECTION_WIDTH} fill="none"
                    onDoubleClick={e => handleWireDoubleClick(e, 0)}
                    onMouseDown={handleWireClick} onMouseOver={() => handleWireHover(true)}
                    onMouseLeave={() => handleWireHover(false)}
                    style={{pointerEvents: wire.active ? 'none' : ''}} strokeLinecap="round"/>
                {wire.points.map((point, i) => (
                    <path
                        key={i}
                        d={`M${point.x} ${point.y} ${wire.points[i + 1] ? `L${wire.points[i + 1].x} ${wire.points[i + 1].y}` : `L${wire.end.x} ${wire.end.y}`}`}
                        stroke="transparent" strokeWidth={WIRE_WIDTH + WIRE_BORDER_WIDTH + WIRE_SELECTION_WIDTH}
                        fill="none"
                        onDoubleClick={e => handleWireDoubleClick(e, i + 1)}
                        onMouseDown={handleWireClick} onMouseOver={() => handleWireHover(true)}
                        onMouseLeave={() => handleWireHover(false)}
                        style={{pointerEvents: wire.active ? 'none' : ''}} strokeLinecap="round"/>
                ))}
            </g>
            <g style={{display: !selected ? 'none' : ''}}>
                <WireJoint wire={wire} x={wire.start.x} y={wire.start.y} id={-1}/>
                {wire.points.map((point, i) => <WireJoint key={i} wire={wire} x={point.x} y={point.y} id={point.id}/>)}
                {wire.end && <WireJoint wire={wire} x={wire.end.x} y={wire.end.y} id={-2}/>}
            </g>
        </>
    )
}