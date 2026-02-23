import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

const FloatingCard = () => {
    const cardRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        cardRef.current.rotation.x = Math.cos(t / 4) / 8;
        cardRef.current.rotation.y = Math.sin(t / 4) / 8;
        cardRef.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
    });

    return (
        <group ref={cardRef}>
            {/* Card Body */}
            <mesh receiveShadow castShadow>
                <boxGeometry args={[3.5, 2.2, 0.1]} />
                <meshPhysicalMaterial
                    color="#3b82f6"
                    roughness={0.1}
                    metalness={0.8}
                    transmission={0.5}
                    thickness={0.5}
                    ior={1.5}
                    clearcoat={1}
                />
            </mesh>

            {/* Chip */}
            <mesh position={[-1.2, 0.2, 0.06]}>
                <boxGeometry args={[0.5, 0.4, 0.01]} />
                <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.3} />
            </mesh>

            {/* Logo placeholder */}
            <mesh position={[1.2, 0.7, 0.06]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
            </mesh>

            {/* Text on card */}
            <Text
                position={[0, -0.6, 0.06]}
                fontSize={0.2}
                color="white"
                font="https://fonts.gstatic.com/s/outfit/v11/Q8idXvIn62E9e5WpSldps_U9.woff"
            >
                PREMIUM NEOSHIFT CARD
            </Text>
        </group>
    );
};

const abstractShape = () => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh position={[2, -1, -2]}>
                <torusKnotGeometry args={[0.8, 0.3, 128, 16]} />
                <MeshDistortMaterial color="#6366f1" speed={2} distort={0.4} />
            </mesh>
        </Float>
    );
}

const Scene3D = () => {
    return (
        <div style={{ width: '100%', height: '500px' }}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

                <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
                    <FloatingCard />
                </Float>

                <mesh position={[0, -1.5, -2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <MeshWobbleMaterial factor={0.1} speed={1} color="#020617" opacity={0.1} transparent />
                </mesh>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default Scene3D;
