import { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Center, OrbitControls } from '@react-three/drei'

/*
  Uses the Khronos MaterialsVariantsShoe model —
  a detailed, realistic sneaker with PBR materials.
  Falls back to shoe-draco from external CDN if available.
*/

const SHOE_URL = '/shoe.glb'

function ShoeModel({ scrollProgress, setHovered }) {
  const groupRef = useRef()
  const { scene } = useGLTF(SHOE_URL)

  // Clone the scene so we can manipulate it without affecting the cache
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useFrame(() => {
    if (groupRef.current) {
      // 360° rotation driven by scroll
      const targetRotation = scrollProgress.current * Math.PI * 2
      // Only apply scroll rotation if not being manually rotated might be tricky
      // But we can let them both influence the scene.
      groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1
      // Subtle idle float
      groupRef.current.position.y = 0.3 + Math.sin(Date.now() * 0.0008) * 0.03
    }
  })

  return (
    <Center>
      <group 
        ref={groupRef} 
        rotation={[0.55, 0, -0.55]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={scene} scale={6.5} />
      </group>
    </Center>
  )
}

useGLTF.preload(SHOE_URL)

function Scene({ scrollProgress, setHovered }) {
  return (
    <>
      {/* Studio Lighting Setup */}
      <ambientLight intensity={0.3} />
      
      {/* Key light — warm, from upper right */}
      <directionalLight
        position={[5, 8, 3]}
        intensity={2}
        castShadow
        color="#fff5ee"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Fill light — cool blue, from left */}
      <directionalLight position={[-5, 4, -3]} intensity={0.6} color="#e0e8ff" />
      
      {/* Rim light — from behind */}
      <directionalLight position={[0, 2, -5]} intensity={0.8} color="#ffffff" />
      
      {/* Accent spotlight from below */}
      <pointLight position={[0, -2, 2]} intensity={0.2} color="#f0f0ff" />

      {/* Manual Rotation Controls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate={false}
        makeDefault
      />

      {/* Shoe */}
      <ShoeModel scrollProgress={scrollProgress} setHovered={setHovered} />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.5}
        scale={6}
        blur={2}
        far={4}
        color="#000000"
      />

      {/* HDR environment for realistic reflections */}
      <Environment preset="studio" />
    </>
  )
}

export default function Shoe3DScene({ scrollProgress }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className={`w-full h-full ${hovered ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 30 }}
        dpr={[1, 2]}
        shadows={{ type: 1 }} // 1 is PCFShadowMap, avoids PCFSoftShadowMap deprecation
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene scrollProgress={scrollProgress} setHovered={setHovered} />
        </Suspense>
      </Canvas>
    </div>
  )
}
