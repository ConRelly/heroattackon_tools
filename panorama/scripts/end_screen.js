/**
    DISCLAIMER:
    This file is heavily inspired and based on the open sourced code from Angel Arena Black Star, respecting their Apache-2.0 License.
    Thanks to Angel Arena Black Star.
 */



var GAME_RESULT = {};
var _ = GameUI.CustomUIConfig()._;


function FinishGame() {
	Game.FinishGame();
}



/**
 * Creates Panel snippet and sets all player-releated information
 *
 * @param {Number} playerId Player ID
 * @param {Panel} rootPanel Panel that will be parent for that player
 */

function Snippet_Player(playerId, rootPanel, index) {
	var panel = $.CreatePanel("Panel", rootPanel, "");
	panel.BLoadLayoutSnippet("Player");
    panel.SetHasClass("IsLocalPlayer", playerId === Game.GetLocalPlayerID());

	var playerData = GAME_RESULT.players[playerId];
	var playerInfo = Game.GetPlayerInfo(playerId);
	panel.FindChildTraverse("PlayerAvatar").steamid = playerInfo.player_steamid;
	panel.FindChildTraverse("PlayerNameScoreboard").steamid = playerInfo.player_steamid;

	panel.index = index; // For backwards compatibility
	panel.style.animationDelay = index * 0.3 + "s";
	$.Schedule(index * 0.3, function() {
		try {
			panel.AddClass("AnimationEnd");
		} catch(e) {};
	});

	panel.FindChildTraverse("HeroIcon").SetImage('file://{images}/heroes/' + playerData.heroName + '.png');
	panel.SetDialogVariableInt("hero_level", Players.GetLevel(playerId));
	panel.SetDialogVariable("hero_name", $.Localize("#"+playerData.heroName));

	panel.SetDialogVariableInt("deaths", Players.GetDeaths(playerId));
	panel.SetDialogVariableInt("saves", playerData.saves);
	panel.SetDialogVariableInt("goldBags", playerData.goldBags);

	panel.SetDialogVariable("damageTaken", playerData.damageTaken);
	panel.SetDialogVariable("bossDamage", playerData.bossDamage);
	panel.SetDialogVariable("heroHealing", playerData.heroHealing);

	panel.SetDialogVariableInt("attack", playerData.attack);
	panel.SetDialogVariableInt("strength", playerData.str);
	panel.SetDialogVariableInt("agility", playerData.agi);
	panel.SetDialogVariableInt("intellect", playerData.int);


	for (var i = 0; i < 9; i++) {
		var item = playerData.items[i];
		var itemPanel = $.CreatePanel("DOTAItemImage", panel.FindChildTraverse(i >= 6 ? "BackpackItemsContainer" : "ItemsContainer"), "");
		if (item) {
			itemPanel.itemname = item;
		}
	}
	
	// 15, 16 
	for (var i = 16; i < 17; i++) {
		var item = playerData.items[i];
		var itemPanel = $.CreatePanel("DOTAItemImage", panel.FindChildTraverse("ItemsContainer"), "");
		if (item) {
			itemPanel.itemname = item;
		}
	}
}



/**
 * Creates Team snippet and all in-team information
 *
 * @param {Number} team Team Index
 */
function Snippet_Team(team) {
	var panel = $.CreatePanel("Panel", $("#TeamsContainer"), "");
	panel.BLoadLayoutSnippet("Team");
	panel.SetHasClass("IsRight", true);
	panel.SetHasClass("IsWinner", GAME_RESULT.isWinner);

	var ids = Game.GetPlayerIDsOnTeam(team)

	for(var i = 0; i < ids.length; i++) {
		Snippet_Player(ids[i], panel, i + 1);
	}
}



function OnGameResult(table, key, gameResult) {
	if (!gameResult || key !== "game_info") {
		FinishGame();
		return;
	}


	$("#LoadingPanel").visible = false;
	$("#EndScreenWindow").visible = true;
	$("#TeamsContainer").RemoveAndDeleteChildren();
	
	GAME_RESULT = gameResult;

	Snippet_Team(2);


	var result_label = $("#EndScreenVictory")
	
	if (GAME_RESULT.isWinner) {
		result_label.text = $.Localize("#end_screen_victory");
		result_label.style.color = "#008000";
	} else {
		result_label.text = $.Localize("#end_screen_defeat");
		result_label.style.color = "#FF0000";
	}
}



(function() {
	GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, false);
	GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME_CHAT, false);
	find_hud_element("GameEndContainer").visible = false;

	$.GetContextPanel().RemoveClass("FadeOut");
	$("#LoadingPanel").visible = true;
	$("#EndScreenWindow").visible = false;

	CustomNetTables.SubscribeNetTableListener("end_game_scoreboard", OnGameResult);
	OnGameResult(null, "game_info", CustomNetTables.GetTableValue("end_game_scoreboard", "game_info"));
})();
