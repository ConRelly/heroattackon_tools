sounds = {}
soundState = true

function EmitSound( data ) {
	let a = ArraySound( data.sound )

	a.push( Game.EmitSound( data.sound ) )
}

function StopSound( data ) {
	let a = ArraySound( data.sound )

	for ( let s of a ) {
		Game.StopSound( s )
	}

	a.splice( 0, a.length - 1 )
}

function ArraySound( sound ) {
	sounds[sound] = sounds[sound] || []

	return sounds[sound]
}

function ToggleSound() {
//	$.Msg( "111" )
	let music_btn = $('#MusicToggleContainer')
	music_btn.ToggleClass('off')
	GameEvents.SendCustomGameEventToServer( "set_sound_state", {  
		state:  !music_btn.BHasClass('off'),
	});
}

GameEvents.Subscribe( "emit_sound", EmitSound )
GameEvents.Subscribe( "stop_sound", StopSound )

function Test() {
	GameEvents.SendCustomGameEventToServer( 'looping_sound_test', {} )
}