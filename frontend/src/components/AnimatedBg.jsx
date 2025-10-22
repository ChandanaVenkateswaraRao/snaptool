import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

// This component represents a single floating shape
const Shape = ({ position, rotationSpeed }) => {
  const meshRef = useRef();

  // This hook runs on every frame, allowing animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed.x * delta;
      meshRef.current.rotation.y += rotationSpeed.y * delta;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.5, 0]} /> {/* A 20-sided geometric shape */}
      <meshStandardMaterial color="#10B981" roughness={0.5} />
    </mesh>
  );
};

const AnimatedBg = () => {
  // useMemo ensures that the random shapes are only generated once
  const shapes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      position: [
        MathUtils.randFloatSpread(15), // x position
        MathUtils.randFloatSpread(15), // y position
        MathUtils.randFloatSpread(15), // z position
      ],
      rotationSpeed: {
        x: MathUtils.randFloat(-0.2, 0.2),
        y: MathUtils.randFloat(-0.2, 0.2),
      },
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#059669" />
        
        {shapes.map((props, i) => (
          <Shape key={i} {...props} />
        ))}
      </Canvas>
    </div>
  );
};

export default AnimatedBg;


