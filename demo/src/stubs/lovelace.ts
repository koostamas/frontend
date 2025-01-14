import type { LocalizeFunc } from "../../../src/common/translations/localize";
import type { MockHomeAssistant } from "../../../src/fake_data/provide_hass";
import { selectedDemoConfig } from "../configs/demo-configs";
import "../custom-cards/cast-demo-row";
import "../custom-cards/ha-demo-card";
import type { HADemoCard } from "../custom-cards/ha-demo-card";

export const mockLovelace = (
  hass: MockHomeAssistant,
  localizePromise: Promise<LocalizeFunc>
) => {
  hass.mockWS("lovelace/config", () =>
    Promise.all([selectedDemoConfig, localizePromise]).then(
      ([config, localize]) => config.lovelace(localize)
    )
  );

  hass.mockWS("lovelace/config/save", () => Promise.resolve());
  hass.mockWS("lovelace/resources", () => Promise.resolve([]));
};

customElements.whenDefined("hui-card").then(() => {
  // eslint-disable-next-line
  const HUIView = customElements.get("hui-card");
  // Patch HUI-VIEW to make the lovelace object available to the demo card
  const oldCreateCard = HUIView!.prototype.createElement;

  HUIView!.prototype.createElement = function (config) {
    const el = oldCreateCard.call(this, config);
    if (config.type === "custom:ha-demo-card") {
      (el as HADemoCard).lovelace = this.lovelace;
    }
    return el;
  };
});
