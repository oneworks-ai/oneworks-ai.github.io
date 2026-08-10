import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const homepageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const studioTemplatePath = resolve(
  homepageRoot,
  '../brand-studio/src/studio.template.html'
)
const componentPath = resolve(
  homepageRoot,
  'apps/homepage/src/components/BrandGravityScene.astro'
)

const source = readFileSync(studioTemplatePath, 'utf8')

const sliceBetween = (startMarker, endMarker) => {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  if (start < 0 || end < 0) {
    throw new Error(`Unable to extract Brand Studio source: ${startMarker}`)
  }
  return source.slice(start, end)
}

const imageDataMatch = source.match(
  /<script type="application\/json" id="ow-brand-image-data">([\s\S]*?)<\/script>/
)
if (!imageDataMatch) throw new Error('Brand Studio image data is missing')
const imageData = JSON.parse(imageDataMatch[1])

let scene = sliceBetween(
  '<div class="runtime-network runtime-network--org">',
  '\n          </div>\n        </div>\n        <p class="mockup-help"'
)
scene += '\n          </div>'
scene = scene.replace(
  '<svg class="runtime-network__lines"',
  '<div class="gravity-orbit-layer" role="group" aria-label="One Works product orbits">\n            <svg class="runtime-network__lines"'
)
scene = scene.replace(
  '<svg class="runtime-network__lines" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">',
  '<svg class="runtime-network__lines" viewBox="0 0 100 50" preserveAspectRatio="none" role="group" aria-label="Product connections">'
)
scene = scene.replace(
  /\n          <\/div>$/,
  '\n            </div>\n          </div>'
)
const staticHubPattern = /<div class="runtime-hub"><img class="mode-image"[^>]*alt="Linear 品牌标记"><\/div>/
if (!staticHubPattern.test(scene)) {
  throw new Error('Brand Studio runtime hub markup is missing')
}
scene = scene.replace(
  staticHubPattern,
  '<div class="runtime-hub" aria-hidden="true"><span class="runtime-hub__loader" data-brand-gravity-hub></span></div>'
)
scene = scene.replaceAll(
  /<div class="(runtime-node|provider-node|channel-node)([^"]*)"/g,
  '<div class="$1$2" aria-hidden="true"'
)
scene = scene.replace(
  '<svg class="gravity-scene-copy gravity-copy"',
  '<svg class="gravity-scene-copy gravity-copy" aria-hidden="true"'
)
scene = scene.replaceAll(/#ow-img-(\d+)/g, (_, index) => {
  const image = imageData[`ow-img-${index}`]
  if (!image) throw new Error(`Brand Studio image ow-img-${index} is missing`)
  return image
})
const firstComet = '<g class="star-field__comet"'
const firstBackgroundStar = '<g class="star-field__diffraction"'
if (!scene.includes(firstComet) || !scene.includes(firstBackgroundStar)) {
  throw new Error('Brand Studio comet layer markup is missing')
}
scene = scene.replace(
  firstComet,
  '<g class="star-field__comets">\n              ' + firstComet
)
scene = scene.replace(
  firstBackgroundStar,
  '</g>\n              ' + firstBackgroundStar
)

const baseStyles = sliceBetween(
  '    #ow-brand-rollout-plan .runtime-network {',
  '    #ow-brand-rollout-plan .x-profile-header {'
)
const orbitStyles = sliceBetween(
  '    #ow-brand-rollout-plan .runtime-network .orbit-trail {',
  '    #ow-brand-rollout-plan .runtime-network--repo .orbit-link'
)
const styles = `${baseStyles}\n${orbitStyles}`
  .replaceAll('#ow-brand-rollout-plan', '.brand-gravity-scene')
  .replace(/^ {4}/gm, '')

const component = `---
// Generated from Brand Studio's canonical GitHub Org README scene.
// Run: pnpm sync:brand-gravity-scene
const sceneHtml = ${JSON.stringify(scene)}
---

<div
  class="brand-gravity-scene"
  data-preview-mode="light"
  set:html={sceneHtml}
></div>

<script>
  // warpjs 1.0.8 is the exact library/version used by Brand Studio.
  import Warp from 'warpjs'

  import { mountOneWorksIconLoader } from '@oneworks/icon/loader'

  import { homepageBrandIconTheme } from '../utils/brand-icon-theme'

  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const desktopOrbitQuery = window.matchMedia('(min-width: 761px)')
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const iconHandles = new Map<
    HTMLElement,
    ReturnType<typeof mountOneWorksIconLoader>
  >()
  const iconPauseStartedAt = new Map<HTMLElement, number>()
  const gravityGridPoints = new Map<SVGPathElement, Array<[number, number]>>()
  const gravityFocusListeners = new Map<HTMLElement, EventListener>()
  type OrbitTone = 'amber' | 'cyan' | 'violet'
  type OrbitSample = {
    offset: number
    phase: number
    x: number
    y: number
  }
  type OrbitMotionGroup = {
    cycleMs: number
    direction: 1 | -1
    hitArea: SVGPathElement
    layoutHeight: number
    layoutWidth: number
    lastTime: number
    nodes: OrbitMotionNode[]
    pauseTarget: HTMLElement | null
    progress: number
    samples: OrbitSample[]
    scene: HTMLElement
    trail: SVGPathElement
  }
  type OrbitMotionNode = {
    element: HTMLElement
    phaseOffset: number
    x: number
    y: number
  }
  type NetworkLinkGroup = {
    centerX: number
    centerY: number
    nodes: OrbitMotionNode[]
    path: SVGPathElement
    scene: HTMLElement
  }
  type CometMotionGroup = {
    angle: number
    centerX: number
    centerY: number
    controlX: number
    controlY: number
    cycleMs: number
    direction: 1 | -1
    element: SVGGElement
    headX: number
    headY: number
    lastTime: number
    phase: number
    scene: HTMLElement
    tailElements: SVGGraphicsElement[]
    tailX: number
    tailY: number
  }
  let cometMotionGroups: CometMotionGroup[] = []
  let networkLinkGroups: NetworkLinkGroup[] = []
  let orbitMotionGroups: OrbitMotionGroup[] = []
  let orbitMotionFrame: number | undefined
  let orbitResizeObserver: ResizeObserver | undefined
  let sceneIntersectionObserver: IntersectionObserver | undefined
  const mountedScenes = new Set<HTMLElement>()
  const visibleScenes = new Set<HTMLElement>()

  const cometCycles = [37000, 49000, 61000, 76000]
  const orbitFocus = { x: 50, y: 20.5 }
  const orgOrbitScale = 1.18
  const gravityStrength = .7
  const gravityFieldRadius = 18
  const innerOrbitCycleMs = 42000
  const orbitSampleCount = 720

  const orbitConfigs: Array<{
    direction: 1 | -1
    selector: string
    tone: OrbitTone
  }> = [
    { direction: 1, selector: '.runtime-node', tone: 'cyan' },
    { direction: -1, selector: '.provider-node', tone: 'violet' },
    { direction: 1, selector: '.channel-node', tone: 'amber' }
  ]

  const buildOrbitSamples = (
    trail: SVGPathElement
  ): { samples: OrbitSample[]; scale: number } => {
    const length = trail.getTotalLength()
    const samples: OrbitSample[] = []
    let cumulativeArea = 0
    let maxRadius = 0
    let minRadius = Number.POSITIVE_INFINITY
    let previousPoint = trail.getPointAtLength(0)

    samples.push({ offset: 0, phase: 0, x: previousPoint.x, y: previousPoint.y })
    for (let index = 1; index <= orbitSampleCount; index += 1) {
      const offset = index / orbitSampleCount
      const point = trail.getPointAtLength(length * offset)
      const previousX = previousPoint.x - orbitFocus.x
      const previousY = previousPoint.y - orbitFocus.y
      const currentX = point.x - orbitFocus.x
      const currentY = point.y - orbitFocus.y
      cumulativeArea += Math.abs(previousX * currentY - previousY * currentX) * .5
      const radius = Math.hypot(currentX, currentY)
      minRadius = Math.min(minRadius, radius)
      maxRadius = Math.max(maxRadius, radius)
      samples.push({ offset, phase: cumulativeArea, x: point.x, y: point.y })
      previousPoint = point
    }

    const totalArea = Math.max(cumulativeArea, Number.EPSILON)
    samples.forEach((sample) => {
      sample.phase /= totalArea
    })
    return {
      samples,
      scale: (minRadius + maxRadius) * .5
    }
  }

  const findClosestOrbitPhase = (
    samples: OrbitSample[],
    element: HTMLElement
  ) => {
    const targetX = Number.parseFloat(element.style.getPropertyValue('--x'))
    const targetY = Number.parseFloat(element.style.getPropertyValue('--y')) / 2
    let closestPhase = 0
    let closestDistance = Number.POSITIVE_INFINITY
    for (const sample of samples) {
      const distance = (sample.x - targetX) ** 2 + (sample.y - targetY) ** 2
      if (distance < closestDistance) {
        closestDistance = distance
        closestPhase = sample.phase
      }
    }
    return closestPhase
  }

  const orbitPointAtPhase = (
    samples: OrbitSample[],
    value: number
  ) => {
    const phase = ((value % 1) + 1) % 1
    let low = 0
    let high = samples.length - 1
    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      if ((samples[middle]?.phase ?? 1) < phase) low = middle + 1
      else high = middle
    }
    const upper = samples[low] ?? samples[samples.length - 1]
    const lower = samples[Math.max(0, low - 1)] ?? upper
    const phaseSpan = Math.max(Number.EPSILON, upper.phase - lower.phase)
    const mix = (phase - lower.phase) / phaseSpan
    return {
      x: lower.x + (upper.x - lower.x) * mix,
      y: lower.y + (upper.y - lower.y) * mix
    }
  }

  const gravityWarpPoint = (
    [x, y]: [number, number],
    centerX: number,
    centerY: number,
    radius = gravityFieldRadius
  ): [number, number] => {
    const dx = x - centerX
    const dy = y - centerY
    const influence = Math.exp(
      -(dx * dx + dy * dy) /
        (2 * radius * radius)
    )
    const scale = 1 - gravityStrength * influence
    return [centerX + dx * scale, centerY + dy * scale]
  }

  const unwarpGravityPoint = (
    [x, y]: [number, number]
  ): [number, number] => {
    const dx = x - orbitFocus.x
    const dy = y - orbitFocus.y
    const warpedRadius = Math.hypot(dx, dy)
    if (warpedRadius < Number.EPSILON) return [orbitFocus.x, orbitFocus.y]
    let lower = warpedRadius
    let upper = warpedRadius + gravityFieldRadius * 2
    for (let iteration = 0; iteration < 28; iteration += 1) {
      const radius = (lower + upper) * .5
      const influence = Math.exp(
        -(radius * radius) /
          (2 * gravityFieldRadius * gravityFieldRadius)
      )
      const projected = radius * (1 - gravityStrength * influence)
      if (projected < warpedRadius) lower = radius
      else upper = radius
    }
    const radius = (lower + upper) * .5
    return [
      orbitFocus.x + dx / warpedRadius * radius,
      orbitFocus.y + dy / warpedRadius * radius
    ]
  }

  const parseGravityPath = (path: SVGPathElement) => {
    const values = path.getAttribute('d')?.match(/-?\\d+(?:\\.\\d+)?/g)
      ?.map(Number) ?? []
    const points: Array<[number, number]> = []
    for (let index = 0; index < values.length; index += 2) {
      const x = values[index]
      const y = values[index + 1]
      if (x != null && y != null) points.push(unwarpGravityPoint([x, y]))
    }
    return points
  }

  const drawGravityGrid = (
    scene: HTMLElement,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    const radius = gravityFieldRadius * scale
    scene.querySelectorAll<SVGPathElement>('.gravity-grid--org path')
      .forEach((path) => {
        let points = gravityGridPoints.get(path)
        if (points == null) {
          points = parseGravityPath(path)
          gravityGridPoints.set(path, points)
        }
        path.setAttribute('d', points.map((point, index) => {
          const [x, y] = gravityWarpPoint(point, centerX, centerY, radius)
          return (index === 0 ? 'M' : 'L') +
            x.toFixed(2) + ' ' + y.toFixed(2)
        }).join(' '))
      })
    const well = scene.querySelector<SVGEllipseElement>('.star-field__well')
    well?.setAttribute('cx', centerX.toFixed(3))
    well?.setAttribute('cy', centerY.toFixed(3))
    well?.setAttribute('rx', (16 * scale).toFixed(3))
    well?.setAttribute('ry', (10.5 * scale).toFixed(3))
  }

  const applyOrbitFocus = (
    scene: HTMLElement,
    detail: { scale?: number; shiftX?: number; shiftY?: number }
  ) => {
    const scale = Number.isFinite(detail.scale) ? detail.scale ?? 1 : 1
    const shiftX = Number.isFinite(detail.shiftX) ? detail.shiftX ?? 0 : 0
    const shiftY = Number.isFinite(detail.shiftY) ? detail.shiftY ?? 0 : 0
    const sceneRect = scene.getBoundingClientRect()
    const width = Math.max(1, sceneRect.width)
    const height = Math.max(1, sceneRect.height)
    const cometShiftPercent = shiftX / width * 100
    scene.style.setProperty('--orbit-layer-scale', scale.toFixed(5))
    scene.style.setProperty('--orbit-layer-shift-x', shiftX.toFixed(2) + 'px')
    scene.style.setProperty('--orbit-layer-shift-y', shiftY.toFixed(2) + 'px')
    scene.style.setProperty('--comet-layer-scale', scale.toFixed(5))
    scene.style.setProperty(
      '--comet-layer-shift-x',
      cometShiftPercent.toFixed(5) + '%'
    )
    scene.style.setProperty(
      '--comet-layer-shift-y',
      (shiftY / height * 100).toFixed(5) + '%'
    )
    drawGravityGrid(
      scene,
      orbitFocus.x + shiftX / width * 100,
      orbitFocus.y + shiftY / height * 50,
      scale
    )
  }

  const buildTailTransform = (
    group: CometMotionGroup,
    lengthScale: number,
    widthScale: number
  ) => {
    const axisX = group.tailX - group.headX
    const axisY = group.tailY - group.headY
    const axisLength = Math.hypot(axisX, axisY)
    const unitX = axisX / axisLength
    const unitY = axisY / axisLength
    const a = lengthScale * unitX * unitX + widthScale * unitY * unitY
    const b = (lengthScale - widthScale) * unitX * unitY
    const c = b
    const d = lengthScale * unitY * unitY + widthScale * unitX * unitX
    const e = group.headX - a * group.headX - c * group.headY
    const f = group.headY - b * group.headX - d * group.headY
    return 'matrix(' + [a, b, c, d, e, f].join(' ') + ')'
  }

  const drawComet = (group: CometMotionGroup) => {
    const lengthPulse = Math.sin(group.angle * 1.7 + group.phase)
    const widthPulse = Math.sin(group.angle * 2.1 + group.phase * 1.4)
    const tailTransform = buildTailTransform(
      group,
      1 + lengthPulse * .08,
      1 + widthPulse * .045
    )
    group.tailElements.forEach((element) => {
      element.setAttribute('transform', tailTransform)
    })
    group.element.setAttribute(
      'transform',
      'rotate(' + group.angle * 180 / Math.PI + ' ' +
        group.centerX + ' ' + group.centerY + ')'
    )
  }

  const isSceneInViewport = (scene: HTMLElement) => {
    const rect = scene.getBoundingClientRect()
    return rect.bottom > 0 && rect.right > 0 &&
      rect.top < window.innerHeight && rect.left < window.innerWidth
  }

  const isSceneMotionActive = (scene: HTMLElement) =>
    !document.hidden && !reducedMotionQuery.matches && visibleScenes.has(scene)

  const stopOrbitMotionFrame = () => {
    if (orbitMotionFrame != null) window.cancelAnimationFrame(orbitMotionFrame)
    orbitMotionFrame = undefined
  }

  const scheduleOrbitMotionFrame = () => {
    if (
      orbitMotionFrame != null ||
      !Array.from(mountedScenes).some(isSceneMotionActive)
    ) return
    const now = performance.now()
    orbitMotionGroups.forEach((group) => { group.lastTime = now })
    cometMotionGroups.forEach((group) => { group.lastTime = now })
    orbitMotionFrame = window.requestAnimationFrame(drawOrbitMotion)
  }

  const syncIconMotion = (iconHost: HTMLElement) => {
    const handle = iconHandles.get(iconHost)
    const scene = iconHost.closest<HTMLElement>('.brand-gravity-scene')
    if (handle == null || scene == null) return
    const shouldRun = isSceneMotionActive(scene) &&
      !iconHost.matches(':hover')
    const pauseStartedAt = iconPauseStartedAt.get(iconHost)
    if (!shouldRun) {
      if (pauseStartedAt == null) {
        iconPauseStartedAt.set(iconHost, performance.now())
        handle.stop()
      }
      return
    }
    if (pauseStartedAt != null) {
      handle.renderer.motionOffset -=
        (performance.now() - pauseStartedAt) / 1000
      iconPauseStartedAt.delete(iconHost)
    }
    handle.start()
  }

  const refreshMotionState = () => {
    mountedScenes.forEach((scene) => {
      scene.dataset.motionPaused = String(!isSceneMotionActive(scene))
    })
    for (const iconHost of iconHandles.keys()) syncIconMotion(iconHost)
    if (Array.from(mountedScenes).some(isSceneMotionActive)) {
      scheduleOrbitMotionFrame()
    } else {
      stopOrbitMotionFrame()
    }
  }

  const cancelOrbitMotion = () => {
    stopOrbitMotionFrame()
    for (const group of cometMotionGroups) {
      group.element.removeAttribute('transform')
      group.element.removeAttribute('data-brand-comet-angle')
      group.tailElements.forEach((element) => element.removeAttribute('transform'))
    }
    orbitMotionFrame = undefined
    cometMotionGroups = []
    networkLinkGroups = []
    orbitMotionGroups = []
    mountedScenes.forEach((scene) => {
      delete scene.dataset.orbitMotionReady
    })
  }

  const measureOrbitLayout = (scene: HTMLElement) => {
    const layout = scene.querySelector<HTMLElement>('.runtime-network--org')
    if (layout == null) return
    for (const group of orbitMotionGroups) {
      if (group.scene !== scene) continue
      group.layoutWidth = Math.max(1, layout.clientWidth)
      group.layoutHeight = Math.max(1, layout.clientHeight)
      group.nodes.forEach((node) => {
        positionOrbitNode(group, node, { x: node.x, y: node.y })
      })
    }
  }

  const positionOrbitNode = (
    group: OrbitMotionGroup,
    node: OrbitMotionNode,
    point: { x: number; y: number }
  ) => {
    node.x = point.x
    node.y = point.y
    const x = (point.x - orbitFocus.x) * orgOrbitScale / 100 *
      group.layoutWidth
    const y = (point.y * 2 - orbitFocus.y * 2) * orgOrbitScale / 100 *
      group.layoutHeight
    node.element.style.setProperty('--orbit-translate-x', x.toFixed(3) + 'px')
    node.element.style.setProperty('--orbit-translate-y', y.toFixed(3) + 'px')
  }

  const drawOrbitMotion = (time: number) => {
    orbitMotionFrame = undefined
    for (const group of orbitMotionGroups) {
      if (!isSceneMotionActive(group.scene)) continue
      const elapsed = Math.min(64, Math.max(0, time - group.lastTime))
      group.lastTime = time
      const paused = group.pauseTarget?.matches(':hover') === true ||
        group.hitArea.matches(':hover') ||
        group.nodes.some(({ element }) => element.matches(':hover'))
      if (!paused) {
        group.progress += elapsed / group.cycleMs * group.direction
      }
      for (const node of group.nodes) {
        const phase = node.phaseOffset + group.progress
        positionOrbitNode(
          group,
          node,
          orbitPointAtPhase(group.samples, phase)
        )
      }
    }
    for (const group of networkLinkGroups) {
      if (!isSceneMotionActive(group.scene)) continue
      group.path.setAttribute(
        'd',
        group.nodes.map((node, index) => {
          const { x, y } = node
          const deltaX = group.centerX - x
          const deltaY = group.centerY - y
          const length = Math.max(1, Math.hypot(deltaX, deltaY))
          const bend = (index % 2 === 0 ? 1 : -1) *
            Math.min(4.8, Math.hypot(deltaX, deltaY) * .14)
          const normalX = -deltaY / length * bend
          const normalY = deltaX / length * bend
          const control1X = x + deltaX * .34 + normalX
          const control1Y = y + deltaY * .34 + normalY
          const control2X = x + deltaX * .72 + normalX * .4
          const control2Y = y + deltaY * .72 + normalY * .4
          return 'M' + x.toFixed(3) + ' ' + y.toFixed(3) +
            ' C' + control1X.toFixed(3) + ' ' + control1Y.toFixed(3) +
            ' ' + control2X.toFixed(3) + ' ' + control2Y.toFixed(3) +
            ' ' + group.centerX + ' ' + group.centerY
        }).join(' ')
      )
    }
    for (const group of cometMotionGroups) {
      if (!isSceneMotionActive(group.scene)) continue
      const elapsed = Math.min(64, Math.max(0, time - group.lastTime))
      group.lastTime = time
      group.angle += elapsed / group.cycleMs * Math.PI * 2 * group.direction
      group.element.dataset.brandCometAngle = String(group.angle)
      drawComet(group)
    }
    scheduleOrbitMotionFrame()
  }

  const mountOrbitMotion = (scenes: NodeListOf<HTMLElement>) => {
    cancelOrbitMotion()
    if (reducedMotionQuery.matches) {
      refreshMotionState()
      return
    }
    const lastTime = performance.now()
    orbitMotionGroups = Array.from(scenes).flatMap((scene) => {
      const groups = orbitConfigs.flatMap((config) => {
        const trail = scene.querySelector<SVGPathElement>(
          '.orbit-trail--' + config.tone
        )
        const hitArea = scene.querySelector<SVGPathElement>(
          '.orbit-hit--' + config.tone
        )
        if (trail == null || hitArea == null) return []
        const orbit = buildOrbitSamples(trail)
        const nodes = Array.from(
          scene.querySelectorAll<HTMLElement>(config.selector)
        ).map((element) => {
          const phaseOffset = findClosestOrbitPhase(orbit.samples, element)
          const point = orbitPointAtPhase(orbit.samples, phaseOffset)
          return { element, phaseOffset, x: point.x, y: point.y }
        })
        const layout = scene.querySelector<HTMLElement>('.runtime-network--org')
        return [{
          cycleMs: innerOrbitCycleMs,
          direction: config.direction,
          hitArea,
          layoutHeight: Math.max(1, layout?.clientHeight ?? scene.clientHeight),
          layoutWidth: Math.max(1, layout?.clientWidth ?? scene.clientWidth),
          lastTime,
          nodes,
          pauseTarget: scene.querySelector<HTMLElement>('.runtime-hub'),
          progress: 0,
          samples: orbit.samples,
          scale: orbit.scale,
          scene,
          trail
        }]
      })
      const referenceScale = Math.min(...groups.map((group) => group.scale))
      return groups.map(({ scale, ...group }) => ({
        ...group,
        cycleMs: innerOrbitCycleMs * (scale / referenceScale) ** 1.5
      }))
    })
    networkLinkGroups = Array.from(scenes).flatMap((scene) => {
      const path = scene.querySelector<SVGPathElement>('.orbit-link')
      if (path == null) return []
      const elements = Array.from(scene.querySelectorAll<HTMLElement>(
        '.runtime-node, .provider-node, .channel-node'
      ))
      const nodeByElement = new Map(
        orbitMotionGroups.flatMap((group) => group.nodes)
          .map((node) => [node.element, node] as const)
      )
      const nodes = elements.flatMap((element) => {
        const node = nodeByElement.get(element)
        return node == null ? [] : [node]
      })
      return [{
        centerX: 50,
        centerY: 20.5,
        nodes,
        path,
        scene
      }]
    })
    cometMotionGroups = Array.from(scenes).flatMap((scene) =>
      Array.from(scene.querySelectorAll<SVGGElement>('.star-field__comet'))
        .flatMap((element, index) => {
          const cycleMs = cometCycles[index % cometCycles.length]
          const centerX = Number(element.dataset.gravityCenterX)
          const centerY = Number(element.dataset.gravityCenterY)
          const controlX = Number(element.dataset.controlX)
          const controlY = Number(element.dataset.controlY)
          const headX = Number(element.dataset.headX)
          const headY = Number(element.dataset.headY)
          const tailX = Number(element.dataset.tailX)
          const tailY = Number(element.dataset.tailY)
          const tailWidth = Number(element.dataset.tailWidth)
          const outerTail = element.querySelector<SVGPathElement>(
            '.star-field__comet-tail--outer'
          )
          const innerTail = element.querySelector<SVGPathElement>(
            '.star-field__comet-tail--inner'
          )
          const head = element.querySelector<SVGCircleElement>(
            '.star-field__comet-head'
          )
          const halo = element.querySelector<SVGCircleElement>(
            '.star-field__comet-halo'
          )
          if (
            cycleMs == null || outerTail == null || innerTail == null ||
            head == null || halo == null ||
            ![centerX, centerY, controlX, controlY, headX, headY,
              tailX, tailY, tailWidth].every(Number.isFinite)
          ) {
            return []
          }
          const radiusX = headX - centerX
          const radiusY = headY - centerY
          const forwardX = headX - tailX
          const forwardY = headY - tailY
          const positiveTangentX = -radiusY
          const positiveTangentY = radiusX
          const direction = (
            forwardX * positiveTangentX + forwardY * positiveTangentY >= 0
              ? 1
              : -1
          ) as 1 | -1
          const originalFill = outerTail.getAttribute('fill')
          if (
            element.dataset.brandCometStroke == null &&
            originalFill != null && originalFill !== 'none'
          ) {
            element.dataset.brandCometStroke = originalFill
          }
          const gradientStroke = element.dataset.brandCometStroke ?? 'currentColor'
          const centerline = 'M' + headX + ' ' + headY + ' Q' +
            controlX + ' ' + controlY + ' ' + tailX + ' ' + tailY
          let mistTail = element.querySelector<SVGPathElement>(
            '.star-field__comet-tail--mist'
          )
          if (mistTail == null) {
            mistTail = outerTail.cloneNode(false) as SVGPathElement
            mistTail.setAttribute(
              'class',
              'star-field__comet-tail star-field__comet-tail--mist'
            )
            outerTail.before(mistTail)
          }
          for (const [tail, width] of [
            [mistTail, tailWidth * 1.65],
            [outerTail, tailWidth * .82],
            [innerTail, tailWidth * .24]
          ] as const) {
            tail.setAttribute('d', centerline)
            tail.setAttribute('fill', 'none')
            tail.setAttribute('stroke', gradientStroke)
            tail.setAttribute('stroke-linecap', 'round')
            tail.setAttribute('stroke-linejoin', 'round')
            tail.setAttribute('stroke-width', String(width))
          }
          element.removeAttribute('transform')
          return [{
            angle: 0,
            centerX,
            centerY,
            controlX,
            controlY,
            cycleMs,
            direction,
            element,
            headX,
            headY,
            lastTime,
            phase: index * 1.73,
            scene,
            tailElements: [
              mistTail,
              outerTail,
              innerTail,
              ...Array.from(
              element.querySelectorAll<SVGCircleElement>(
                '.star-field__comet-particle'
              )
              )
            ],
            tailX,
            tailY
          }]
        })
    )
    orbitMotionGroups.forEach((group) => {
      group.nodes.forEach((node) => {
        positionOrbitNode(
          group,
          node,
          orbitPointAtPhase(group.samples, node.phaseOffset)
        )
      })
      group.scene.dataset.orbitMotionReady = 'true'
    })
    refreshMotionState()
  }

  const stableNoise = (index: number, salt: number) => {
    const value = Math.sin((index + 1) * salt) * 43758.5453123
    return value - Math.floor(value)
  }

  const mountStarTwinkle = (scene: HTMLElement) => {
    const stars = scene.querySelectorAll<SVGGraphicsElement>(
      '.star-field__dot, .star-field__diffraction, ' +
      '.star-field__particle-halo, .star-field__particle-satellite'
    )
    stars.forEach((star, index) => {
      star.removeAttribute('data-twinkle-ready')
      const baseOpacity = Number.parseFloat(getComputedStyle(star).opacity)
      const depth = .28 + stableNoise(index, 12.9898) * .42
      const peak = Math.min(1, baseOpacity * (1.02 + stableNoise(index, 39.346) * .18))
      star.style.setProperty('--twinkle-min', String(baseOpacity * (1 - depth)))
      star.style.setProperty('--twinkle-max', String(peak))
      star.style.setProperty(
        '--twinkle-duration',
        (1800 + stableNoise(index, 78.233) * 5200) + 'ms'
      )
      star.style.setProperty(
        '--twinkle-delay',
        (-stableNoise(index, 93.989) * 6800) + 'ms'
      )
      star.setAttribute('data-twinkle-ready', 'true')
    })
  }

  const syncTheme = () => {
    const mode = darkQuery.matches ? 'dark' : 'light'
    document.querySelectorAll<HTMLElement>('.brand-gravity-scene').forEach((scene) => {
      scene.dataset.previewMode = mode
      scene.querySelectorAll<HTMLImageElement>('.mode-image').forEach((image) => {
        image.src = mode === 'dark'
          ? image.dataset.darkSrc ?? image.src
          : image.dataset.lightSrc ?? image.src
      })
      mountStarTwinkle(scene)
    })
    for (const handle of iconHandles.values()) handle.update({ mode })
  }

  const syncOrbitHitAccessibility = () => {
    document.querySelectorAll<SVGPathElement>('.brand-gravity-scene .orbit-hit')
      .forEach((hitArea) => {
        if (desktopOrbitQuery.matches) {
          hitArea.removeAttribute('aria-hidden')
          hitArea.setAttribute('tabindex', '0')
          return
        }
        hitArea.setAttribute('aria-hidden', 'true')
        hitArea.setAttribute('tabindex', '-1')
      })
  }

  const mountBrandGravityScene = () => {
    const scenes = document.querySelectorAll<HTMLElement>('.brand-gravity-scene')

    scenes.forEach((scene) => {
      mountedScenes.add(scene)
      if (isSceneInViewport(scene)) visibleScenes.add(scene)
      const iconHost = scene.querySelector<HTMLElement>('[data-brand-gravity-hub]')
      if (iconHost != null && !iconHandles.has(iconHost)) {
        iconHandles.set(iconHost, mountOneWorksIconLoader(iconHost, {
          appearance: 'system',
          background: false,
          canvasClassName: 'runtime-hub__canvas',
          className: 'runtime-hub__loader-mounted',
          mode: darkQuery.matches ? 'dark' : 'light',
          motion: true,
          random: false,
          seed: 'oneworks',
          shadow: false,
          size: '100%',
          theme: homepageBrandIconTheme
        }))
      }
      if (iconHost != null && iconHost.dataset.brandHoverReady !== 'true') {
        iconHost.addEventListener('pointerenter', () => {
          const handle = iconHandles.get(iconHost)
          if (handle == null || iconPauseStartedAt.has(iconHost)) return
          iconPauseStartedAt.set(iconHost, performance.now())
          handle.stop()
        })
        iconHost.addEventListener('pointerleave', () => {
          syncIconMotion(iconHost)
        })
        iconHost.dataset.brandHoverReady = 'true'
      }

      scene.querySelectorAll<SVGPathElement>('.orbit-trail').forEach((trail) => {
        if (trail.previousElementSibling?.classList.contains('orbit-hit')) return
        const tone = ['cyan', 'violet', 'amber'].find((value) =>
          trail.classList.contains('orbit-trail--' + value)
        )
        if (tone == null) return
        const hitArea = trail.cloneNode(false) as SVGPathElement
        hitArea.setAttribute('class', 'orbit-hit orbit-hit--' + tone)
        const kind = tone === 'cyan'
          ? 'adapter'
          : tone === 'violet'
          ? 'model-service'
          : 'channel'
        const label = kind === 'adapter'
          ? 'Adapter orbit'
          : kind === 'model-service'
          ? 'Model service orbit'
          : 'Channel orbit'
        hitArea.dataset.orbitKind = kind
        hitArea.setAttribute('aria-label', label)
        hitArea.setAttribute('role', 'button')
        const selectOrbit = () => {
          if (!desktopOrbitQuery.matches) return
          scene.dispatchEvent(new CustomEvent('oneworks:brand-orbit-select', {
            bubbles: true,
            detail: { kind }
          }))
        }
        hitArea.addEventListener('click', selectOrbit)
        hitArea.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          selectOrbit()
        })
        trail.before(hitArea)
      })

      syncOrbitHitAccessibility()

      if (!gravityFocusListeners.has(scene)) {
        const focusListener: EventListener = (event) => {
          const detail = (event as CustomEvent<{
            scale?: number
            shiftX?: number
            shiftY?: number
          }>).detail
          applyOrbitFocus(scene, detail ?? {})
        }
        scene.addEventListener('oneworks:brand-focus-progress', focusListener)
        gravityFocusListeners.set(scene, focusListener)
      }

      scene.querySelectorAll<SVGGElement>('.gravity-outline-group').forEach((group) => {
        if (group.dataset.gravityWarped === 'true') return
        const centerX = Number(group.dataset.gravityCenterX)
        const centerY = Number(group.dataset.gravityCenterY)
        const strength = Number(group.dataset.gravityStrength)
        const warp = new Warp(group)
        warp.interpolate(.34)
        warp.transform(([x, y]: [number, number]) => {
          const dx = x - centerX
          const dy = y - centerY
          const influence = Math.exp(
            -(dx * dx + dy * dy) / (2 * 18 * 18)
          )
          const scale = 1 - strength * influence
          return [centerX + dx * scale, centerY + dy * scale]
        })
        group.dataset.gravityWarped = 'true'
      })
    })

    sceneIntersectionObserver ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const scene = entry.target as HTMLElement
        if (entry.isIntersecting) visibleScenes.add(scene)
        else visibleScenes.delete(scene)
      })
      refreshMotionState()
    })
    orbitResizeObserver ??= new ResizeObserver((entries) => {
      entries.forEach((entry) => measureOrbitLayout(entry.target as HTMLElement))
    })
    scenes.forEach((scene) => {
      sceneIntersectionObserver?.observe(scene)
      orbitResizeObserver?.observe(scene)
    })

    mountOrbitMotion(scenes)
    syncTheme()
  }

  const unmountBrandGravityScene = () => {
    cancelOrbitMotion()
    sceneIntersectionObserver?.disconnect()
    sceneIntersectionObserver = undefined
    orbitResizeObserver?.disconnect()
    orbitResizeObserver = undefined
    for (const handle of iconHandles.values()) handle.dispose()
    iconHandles.clear()
    iconPauseStartedAt.clear()
    for (const [scene, listener] of gravityFocusListeners) {
      scene.removeEventListener('oneworks:brand-focus-progress', listener)
    }
    gravityFocusListeners.clear()
    gravityGridPoints.clear()
    mountedScenes.clear()
    visibleScenes.clear()
  }

  darkQuery.addEventListener('change', syncTheme)
  desktopOrbitQuery.addEventListener('change', syncOrbitHitAccessibility)
  reducedMotionQuery.addEventListener('change', mountBrandGravityScene)
  document.addEventListener('visibilitychange', refreshMotionState)
  document.addEventListener('astro:before-swap', unmountBrandGravityScene)
  document.addEventListener('astro:page-load', mountBrandGravityScene)
  window.addEventListener('pagehide', unmountBrandGravityScene, { once: true })
  mountBrandGravityScene()
</script>

<style is:global>
  .brand-gravity-scene {
    --ow-card-bg: #f8fafc;
    --ow-card-fg: #141d24;
    --ow-card-muted: #5c6972;
    --ow-card-line: rgba(20, 29, 36, .12);
    --ow-card-soft: #edf1f4;
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(100vw, calc(100svh * 2.01875));
    aspect-ratio: 1292 / 640;
    overflow: hidden;
    background: var(--ow-card-bg);
    color: var(--ow-card-fg);
    color-scheme: light dark;
    transform: translate(-50%, -50%);
  }

  .brand-gravity-scene[data-preview-mode='dark'] {
    --ow-card-bg: #080a0d;
    --ow-card-fg: #e2ebf2;
    --ow-card-muted: #8e9aa3;
    --ow-card-line: rgba(226, 235, 242, .12);
    --ow-card-soft: #11161b;
  }

  @media (max-width: 760px) {
    .brand-gravity-scene {
      top: 48%;
      width: clamp(760px, 220vw, 900px);
    }
  }

${styles}

  .brand-gravity-scene .runtime-hub__loader {
    display: block;
    height: 100%;
    position: relative;
    width: 100%;
  }

  .brand-gravity-scene .runtime-hub__canvas {
    display: block;
    height: 100%;
    width: 100%;
  }

  .brand-gravity-scene .gravity-orbit-layer {
    inset: 0;
    position: absolute;
    transform:
      translate3d(
        var(--orbit-layer-shift-x, 0px),
        var(--orbit-layer-shift-y, 0px),
        0
      )
      scale(var(--orbit-layer-scale, 1));
    transform-origin: 50% 41%;
    will-change: transform;
  }

  .brand-gravity-scene .star-field__comets {
    transform:
      translate3d(
        var(--comet-layer-shift-x, 0%),
        var(--comet-layer-shift-y, 0%),
        0
      )
      scale(var(--comet-layer-scale, 1));
    transform-box: view-box;
    transform-origin: 50% 41%;
    will-change: transform;
  }

  .brand-gravity-scene .runtime-network--org .runtime-hub {
    cursor: pointer;
    height: clamp(104px, 15vw, 156px);
    pointer-events: auto;
    transition: filter 220ms ease, transform 260ms cubic-bezier(.22, 1, .36, 1);
    width: clamp(104px, 15vw, 156px);
  }

  .brand-gravity-scene .runtime-network--org .runtime-hub:hover {
    filter: brightness(1.08) drop-shadow(0 0 12px rgba(113, 201, 230, .2));
    transform: translate(-50%, -50%) scale(1.14);
    z-index: 6;
  }

  .brand-gravity-scene .runtime-network--org .runtime-node {
    height: clamp(17px, 2.35vw, 26px);
    width: clamp(17px, 2.35vw, 26px);
  }

  .brand-gravity-scene .runtime-network--org .provider-node,
  .brand-gravity-scene .runtime-network--org .channel-node {
    height: clamp(14px, 1.95vw, 22px);
    width: clamp(14px, 1.95vw, 22px);
  }

  .brand-gravity-scene .runtime-network--org .orbit-trail,
  .brand-gravity-scene .runtime-network--org .orbit-trail.orbit-trail--soft {
    opacity: .5;
    transition: filter 180ms ease, opacity 180ms ease;
  }

  .brand-gravity-scene .runtime-network--org .orbit-hit {
    cursor: pointer;
    opacity: 1;
    pointer-events: stroke;
    stroke: transparent;
    stroke-dasharray: none;
    stroke-width: 16;
  }

  .brand-gravity-scene .runtime-network--org .orbit-hit:focus {
    outline: none;
  }

  .brand-gravity-scene .runtime-network--org .orbit-hit:focus-visible {
    filter: none;
    stroke: transparent;
  }

  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--cyan:focus-visible)
    .orbit-trail--cyan,
  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--violet:focus-visible)
    .orbit-trail--violet,
  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--amber:focus-visible)
    .orbit-trail--amber {
    filter: brightness(1.35);
    opacity: .82;
  }

  .brand-gravity-scene .runtime-network--org .runtime-node,
  .brand-gravity-scene .runtime-network--org .provider-node,
  .brand-gravity-scene .runtime-network--org .channel-node {
    --orbit-node-scale: 1;
    cursor: default;
    filter: brightness(1);
    opacity: .5;
    pointer-events: auto;
    transition: filter 180ms ease, opacity 180ms ease, transform 180ms ease;
  }

  .brand-gravity-scene .runtime-network--org .runtime-node:hover,
  .brand-gravity-scene .runtime-network--org .provider-node:hover,
  .brand-gravity-scene .runtime-network--org .channel-node:hover {
    filter: brightness(1.45) saturate(1.18);
    opacity: 1;
    --orbit-node-scale: 1.12;
    z-index: 5;
  }

  .brand-gravity-scene[data-orbit-motion-ready='true']
    .runtime-network--org .runtime-node,
  .brand-gravity-scene[data-orbit-motion-ready='true']
    .runtime-network--org .provider-node,
  .brand-gravity-scene[data-orbit-motion-ready='true']
    .runtime-network--org .channel-node {
    left: 50%;
    top: 41%;
    transform:
      translate(-50%, -50%)
      translate3d(
        var(--orbit-translate-x, 0),
        var(--orbit-translate-y, 0),
        0
      )
      scale(var(--orbit-node-scale));
    transition: filter 180ms ease, opacity 180ms ease;
    will-change: transform;
  }

  .brand-gravity-scene .runtime-network--org:has(.runtime-node:hover)
    .orbit-trail--cyan,
  .brand-gravity-scene .runtime-network--org:has(.provider-node:hover)
    .orbit-trail--violet,
  .brand-gravity-scene .runtime-network--org:has(.channel-node:hover)
    .orbit-trail--amber {
    filter: brightness(1.55) drop-shadow(0 0 2px currentColor);
    opacity: 1;
  }

  .brand-gravity-scene .runtime-network--org .orbit-hit--cyan:hover
    + .orbit-trail--cyan,
  .brand-gravity-scene .runtime-network--org .orbit-hit--violet:hover
    + .orbit-trail--violet,
  .brand-gravity-scene .runtime-network--org .orbit-hit--amber:hover
    + .orbit-trail--amber {
    filter: brightness(1.55) drop-shadow(0 0 2px currentColor);
    opacity: 1;
  }

  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--cyan:hover)
    .runtime-node,
  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--violet:hover)
    .provider-node,
  .brand-gravity-scene .runtime-network--org:has(.orbit-hit--amber:hover)
    .channel-node {
    filter: brightness(1.45) saturate(1.18);
    opacity: 1;
  }

  .brand-gravity-scene [data-twinkle-ready='true'] {
    animation: brand-star-twinkle var(--twinkle-duration) ease-in-out
      var(--twinkle-delay) infinite alternate;
  }

  .brand-gravity-scene[data-motion-paused='true']
    [data-twinkle-ready='true'] {
    animation-play-state: paused;
  }

  @keyframes brand-star-twinkle {
    0%, 12% { opacity: var(--twinkle-min); }
    64%, 100% { opacity: var(--twinkle-max); }
  }

  .brand-gravity-scene .star-field__comet-tail--mist {
    filter: blur(.52px);
    opacity: .13;
  }

  .brand-gravity-scene .star-field__comet-tail--outer {
    filter: blur(.24px);
    opacity: .3;
  }

  .brand-gravity-scene .star-field__comet-tail--inner {
    filter: blur(.06px);
    opacity: .72;
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-gravity-scene [data-twinkle-ready='true'] {
      animation: none;
    }
  }
</style>
`

writeFileSync(componentPath, component)
process.stdout.write(`Synced ${componentPath}\n`)
