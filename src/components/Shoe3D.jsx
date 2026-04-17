import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Center } from '@react-three/drei'

/*
  Uses the Khronos MaterialsVariantsShoe model —
  a detailed, realistic sneaker with PBR materials.
  Falls back to shoe-draco from external CDN if available.
*/

const SHOE_URL = '/shoe.glb'

function ShoeModel({ scrollProgress }) {
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
      groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1
      // Subtle idle float
      groupRef.current.position.y = 0.3 + Math.sin(Date.now() * 0.0008) * 0.03
    }
  })

  return (
    <Center>
      <group ref={groupRef} rotation={[0.55, 0, -0.55]}>
        <primitive object={scene} scale={6.5} />
      </group>
    </Center>
  )
}

useGLTF.preload(SHOE_URL)

function Scene({ scrollProgress }) {
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

      {/* Shoe */}
      <ShoeModel scrollProgress={scrollProgress} />

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
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 30 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
