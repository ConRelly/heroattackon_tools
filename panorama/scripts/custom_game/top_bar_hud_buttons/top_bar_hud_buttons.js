var TopBarButtons = GameUI.CustomUIConfig().TopBarButtons || {};
var Constants = GameUI.CustomUIConfig().Constants;

function OnDiscordButtonPressed() {
    $.DispatchEvent("ExternalBrowserGoToURL", $.GetContextPanel(), "https://discord.gg/y8Cx69w");
    Game.EmitSound("Item.PickUpGemShop");
}

function OnPatreonButtonPressed() {
    $.DispatchEvent("ExternalBrowserGoToURL", $.GetContextPanel(), "https://www.patreon.com/conrelly");
    Game.EmitSound("Item.PickUpGemShop");
}

function OnSiteButtonPressed() {
    $.DispatchEvent("ExternalBrowserGoToURL", $.GetContextPanel(), "https://conrelly.com");
    Game.EmitSound("Item.PickUpGemShop");
}

(function() { 
    TopBarButtons.SetButton(Constants.TOP_BAR_BUTTONS.PATREON, $("#PatreonButton"));
    TopBarButtons.SetButton(Constants.TOP_BAR_BUTTONS.DISCORD, $("#DiscordButton"));
    TopBarButtons.SetButton(Constants.TOP_BAR_BUTTONS.DISCORD, $("#SiteButton"));
})();
