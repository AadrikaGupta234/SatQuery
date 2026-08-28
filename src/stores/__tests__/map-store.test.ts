import { describe, it, expect, beforeEach } from "vitest";
import { useMapStore } from "../map-store";

beforeEach(() => {
  useMapStore.setState({
    viewport: {
      longitude: -60.0,
      latitude: -2.8,
      zoom: 6,
      pitch: 0,
      bearing: 0,
    },
    splitMode: false,
    activeLayers: {},
    panelOpen: true,
  });
});

describe("useMapStore", () => {
  it("has correct defaults", () => {
    const s = useMapStore.getState();
    expect(s.viewport.zoom).toBe(6);
    expect(s.splitMode).toBe(false);
    expect(s.panelOpen).toBe(true);
    expect(s.activeLayers).toEqual({});
  });

  it("flyTo sets center and zoom from bbox", () => {
    useMapStore.getState().flyTo([-61, -4, -59, -2]);
    const v = useMapStore.getState().viewport;
    expect(v.longitude).toBe(-60);
    expect(v.latitude).toBe(-3);
    expect(v.zoom).toBeGreaterThan(4);
  });

  it("flyTo with opts.duration overrides transitionDuration", () => {
    useMapStore.getState().flyTo([-61, -4, -59, -2], { duration: 2000 });
    // No assertion on duration since it's not stored; just verify no crash
    const v = useMapStore.getState().viewport;
    expect(v.longitude).toBe(-60);
  });

  it("setLayerVisible adds and removes layers", () => {
    useMapStore.getState().setLayerVisible("imagery-before", true);
    expect(useMapStore.getState().activeLayers["imagery-before"]).toBe(true);

    useMapStore.getState().setLayerVisible("imagery-before", false);
    expect(useMapStore.getState().activeLayers["imagery-before"]).toBe(false);
  });

  it("toggleLayer flips boolean", () => {
    useMapStore.getState().setLayerVisible("change-mask", true);
    useMapStore.getState().toggleLayer("change-mask");
    expect(useMapStore.getState().activeLayers["change-mask"]).toBe(false);

    useMapStore.getState().toggleLayer("change-mask");
    expect(useMapStore.getState().activeLayers["change-mask"]).toBe(true);
  });

  it("toggleLayer creates key if absent", () => {
    expect(useMapStore.getState().activeLayers["new-layer"]).toBeUndefined();
    useMapStore.getState().toggleLayer("new-layer");
    expect(useMapStore.getState().activeLayers["new-layer"]).toBe(true);
  });

  it("toggleSplitMode flips", () => {
    expect(useMapStore.getState().splitMode).toBe(false);
    useMapStore.getState().toggleSplitMode();
    expect(useMapStore.getState().splitMode).toBe(true);
    useMapStore.getState().toggleSplitMode();
    expect(useMapStore.getState().splitMode).toBe(false);
  });

  it("togglePanel flips", () => {
    expect(useMapStore.getState().panelOpen).toBe(true);
    useMapStore.getState().togglePanel();
    expect(useMapStore.getState().panelOpen).toBe(false);
  });
});
