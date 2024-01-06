var players = {};
var players_damage = {};
var panel;
var panel_damage_detail = null;
var panel_damage_detail_player_id = null;
var length = -1;
var currentRound = 1;
var showLast2RoundsOnly = false;
var currentPlayerId = null;

function AddDebugPlayer(color) {
  panel = $.CreatePanel('Panel', $('#Players'), '');
  panel.BLoadLayoutSnippet("Player");
  panel.FindChildTraverse('PlayerNameSignal').text = "assbutt";
  panel.FindChildTraverse('PlayerDamageDealth').text = "666"
  panel.FindChildTraverse('PlayerDamageTaken').text = "666";
  $.Msg("hello")
}

function InitPlayer(name) {
  panel = $.CreatePanel('Panel', $('#Players'), '');
  panel.BLoadLayoutSnippet("Player");

  panel.FindChildTraverse('PlayerHeroSignal').text = $.Localize("#" + name.name);
  panel.FindChildTraverse('PlayerDamageDealt').text = "0";
  panel.FindChildTraverse('PlayerDamageTaken').text = "0";
  panel.FindChildTraverse('PlayerDamageHealed').text = "0";
  panel.FindChildTraverse('PlayerDPS').text = "0";
  panel.player_id = name.id;
  players[name.id] = {
    panel: panel,
    damage: {} 
  };
  length = length + 1;

  var playerId = name.id;
  var heroName = name.name;

  panel.FindChildTraverse("HeroIcon").SetImage('file://{images}/heroes/' + heroName + '.png');

  panel.SetPanelEvent('onactivate', function () {
    ShowPlayerDamageDetail(playerId);
  });

  if (panel_damage_detail == null) {
    panel_damage_detail = $('#damage_detail');
  }
}


function Delete() {
  for (i = 0; i <= length; i++) {
    players[i].panel.RemoveAndDeleteChildren();
    $.Msg(i)
  }
  length = -1;
}

function InitPlayer_New(name) {
  if (players[name.id] == undefined) {
    InitPlayer(name)
  }
}

function ToggleUI() {
  var PlayersPanel = $('#Players');
  PlayersPanel.visible = !PlayersPanel.visible;
}

function ShowPlayerDamageDetail(playerId) {
  panel_damage_detail_player_id = playerId;
  currentPlayerId = playerId;
  UpdateDamageDetail();
  panel_damage_detail.visible = true;
}

function HideDamageDetail() {
  panel_damage_detail.visible = false;
}

function UpdateDamageDetail() {
  var p_mage_list = panel_damage_detail.FindChildTraverse("damage_detail_mage_list");
  var p_phys_list = panel_damage_detail.FindChildTraverse("damage_detail_phys_list");
  var p_pure_list = panel_damage_detail.FindChildTraverse("damage_detail_pure_list");

  RemoveChild(p_mage_list);
  RemoveChild(p_phys_list);
  RemoveChild(p_pure_list);

  var mage_data = players_damage[panel_damage_detail_player_id]["mage"];
  var phys_data = players_damage[panel_damage_detail_player_id]["phys"];
  var pure_data = players_damage[panel_damage_detail_player_id]["pure"];

  UpdateDamageDetail_List(p_mage_list, mage_data);
  UpdateDamageDetail_List(p_phys_list, phys_data);
  UpdateDamageDetail_List(p_pure_list, pure_data);
}

function UpdateDamageDetail_List(p_list, table) {
  RemoveChild(p_list);

  var playerId = table.id;
  var heroName = table.name;
  var damage_table = table.damage_table;

  var damage_table_desc = [];
  for (var inflictor in damage_table) {
    var damage = 0;
    for (var round in damage_table[inflictor]) {
      if (!showLast2RoundsOnly || round >= currentRound - 1) {
        damage += damage_table[inflictor][round];
      }
    }
    damage_table_desc.push({
      inflictor: inflictor,
      damage: damage
    });
  }

  damage_table_desc.sort(function (a, b) {
    return b.damage - a.damage;
  });

  for (var i = 0; i < damage_table_desc.length; i++) {
    var inflictor = damage_table_desc[i].inflictor;
    var damage = damage_table_desc[i].damage;

    var iPanel = $.CreatePanel("Panel", p_list, "");
    iPanel.AddClass("damage_detail_pure_list_i");

    if (inflictor.startsWith("item_")) {
      var itemPanel = $.CreatePanel("DOTAItemImage", iPanel, "");
      itemPanel.itemname = inflictor;
    } else if (inflictor.startsWith("attack")) {
      var panel = $.CreatePanel("Panel", iPanel, "");
      panel.BLoadLayoutSnippet("AttackColumn");
    } else if (inflictor == "other") {
    } else {
      var abilityPanel = $.CreatePanel("DOTAAbilityImage", iPanel, "");
      abilityPanel.abilityname = inflictor;
    }

    if (iPanel.GetChildCount() == 0) {
      iPanel.RemoveAndDeleteChildren();
    } else {
      var damagePanel = $.CreatePanel("Label", iPanel, "");
      damagePanel.AddClass("damage_detail_pure_list_i_d");
      damagePanel.text = formated_number(damage);
    }
  }
}

function SetHeroDamage(table) {
  var playerId = table.id;
  var heroName = table.name;
  var damage_type = table.damage_type;
  var damage_table = table.damage_table;
  if (players_damage[playerId] == undefined) {
    players_damage[playerId] = {};
  }

  players_damage[playerId][damage_type] = table;

  if (panel_damage_detail != null && panel_damage_detail.visible && panel_damage_detail_player_id != null) {
    UpdateDamageDetail();
  }
}

function SetDamageDealt(damage) {
  InitPlayer_New(damage);
  if (typeof (players[damage.id]) == "object") {
    players[damage.id].panel.FindChildTraverse('PlayerDamageDealt').text = damage.damage;
  }
}

function SetDamageTaken(damage) {
  InitPlayer_New(damage);
  if (typeof (players[damage.id]) == "object") {
    players[damage.id].panel.FindChildTraverse('PlayerDamageTaken').text = damage.damage;
  }
}

function SetDamageHealed(damage) {
  InitPlayer_New(damage);
  if (typeof (players[damage.id]) == "object") {
    players[damage.id].panel.FindChildTraverse('PlayerDamageHealed').text = damage.damage;
  }
}

function SetDPS(damage) {
  InitPlayer_New(damage);
  if (typeof (players[damage.id]) == "object") {
    players[damage.id].panel.FindChildTraverse('PlayerDPS').text = damage.damage;
  }
}

function SetDamageTypes(damage) {
  InitPlayer_New(damage);
  var total = damage.physical + damage.magical + damage.pure;
  var physpercent = Math.floor(damage.physical / total * 100);
  var magpercent = Math.floor(damage.magical / total * 100);
  var purepercent = Math.floor(damage.pure / total * 100);
  if (physpercent + magpercent + purepercent < 100) {
    if (physpercent > magpercent && physpercent > purepercent)
      physpercent = 100 - magpercent - purepercent;
    else if (magpercent > purepercent)
      magpercent = 100 - physpercent - purepercent;
    else
      purepercent = 100 - physpercent - magpercent;
  }
  players[damage.id].panel.FindChildTraverse('Playerphysdamagepercent').text = physpercent + "%";
  players[damage.id].panel.FindChildTraverse('Playermagdamagepercent').text = magpercent + "%";
  players[damage.id].panel.FindChildTraverse('Playerpuredamagepercent').text = purepercent + "%";

  players[damage.id].panel.FindChildTraverse("PlayerPhysical").style.width = physpercent + "%";
  players[damage.id].panel.FindChildTraverse("PlayerMagical").style.width = magpercent + "%";
  players[damage.id].panel.FindChildTraverse("PlayerPure").style.width = purepercent + "%";
}

function GetHexPlayerColor(playerId) {
  var playerColor = Players.GetPlayerColor(playerId).toString(16);
  return playerColor == null ? '#000000' : ('#' + playerColor.substring(6, 8) + playerColor.substring(4, 6) + playerColor.substring(2, 4) + playerColor.substring(0, 2));
}

function RemoveChild(panel) {
  if (panel.GetChildCount() > 0) {
    for (var i = 0; i < panel.GetChildCount(); i++) {
      var lastPanel = panel.GetChild(i);
      lastPanel.deleted = true;
      lastPanel.DeleteAsync(0);
    }
  }
}

function formated_number(number) {
  var as_string = String(Math.floor(number));
  if (number < 1000) {
    return as_string;
  }
  if (number > 1000000000) {
    var len = as_string.length;
    var split_point = len - 9;

    return as_string.substring(0, split_point) + "." + as_string.substring(split_point, len - 8) + "B";
  } else if (number > 1000000) {
    var len = as_string.length;
    var split_point = len - 6;

    return as_string.substring(0, split_point) + "." + as_string.substring(split_point, len - 5) + "M";
  }
  var len = as_string.length;
  var split_point = len - 3;

  return as_string.substring(0, split_point) + "." + as_string.substring(split_point, len - 2) + "K";
}

function InitEvent() {
  GameEvents.Subscribe("damage_update", SetDamageDealt);
  GameEvents.Subscribe("damage_taken_update", SetDamageTaken);
  GameEvents.Subscribe("heal_update", SetDamageHealed);
  GameEvents.Subscribe("dps_update", SetDPS);
  GameEvents.Subscribe("damage_type_update", SetDamageTypes);
  GameEvents.Subscribe("hero_damage", SetHeroDamage);
  GameEvents.Subscribe("round_started", OnRoundStarted);
  GameEvents.Subscribe("round_ended", OnRoundEnded);
}

function OnRoundStarted(event) {
  currentRound = event.round;
  UpdateDamageDetail();
}

function OnRoundEnded(event) {
  currentRound = event.round;
}

function ToggleDamageView() {
  showLast2RoundsOnly = !showLast2RoundsOnly;
  var button = $("#damageViewToggle");
  if (showLast2RoundsOnly) {
    button.AddClass("active");
  } else {
    button.RemoveClass("active");
  }
  UpdateDamageDetail();
}
function UpdateToggleDamageView() {
  var button = $("#damageViewToggle");
  if (showLast2RoundsOnly) {
    button.AddClass("active");
  } else {
    button.RemoveClass("active");
  }
}

// Call UpdateToggleDamageView() initially to set the correct active class
UpdateToggleDamageView();

InitEvent();
