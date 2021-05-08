#!/usr/bin/env node

// Dépendences
const fetch = require('node-fetch'); // https://www.npmjs.com/package/node-fetch
const meow = require('meow'); // https://www.npmjs.com/package/meow
const chalk = require('chalk'); // https://www.npmjs.com/package/chalk

// Utilisation de meow pour le CLI
const cli = meow(`
	Utilisation
	  $ ipinfo

	Options
	  --ip -i <IP>          IP (Si non fournis, utilise la votre)
	  --version -v          Indique la version actuellement utilisé
`, {
	flags: {
		ip: {
			type: 'string',
			alias: 'i'
		},
		version: {
			type: 'boolean',
			alias: 'v'
		}
	},
	autoVersion: false
});

// Donner la version avec l'option associé
if(cli.flags.version){
	console.log("Votre IP-Info utilise actuellement la version 1.0.0")
	console.log("\nMettre à jour : " + chalk.cyan("https://github.com/johan-perso/IP-info"))
	return process.exit()
}

// Appeler la fonction avec certaine info
if(cli.flags.ip) fetchinfo(cli.flags.ip)
if(!cli.flags.ip) fetchip()

// Obtenir sa propre ip
function fetchip(){
	// Dire qu'on récupère l'IP...
	console.log("Récupération de votre IP...\n")

	// Récuperer l'IP
    fetch('https://api.ipify.org?format=raw')
    .then(res => res.text())
    .then(data => fetchinfo(data))
	.catch(err => {
		// En cas d'erreur
		if(err.code === "ENOTFOUND") return console.log(chalk.red("Erreur de réseau / de l'API (ipify.org)...")) && process.exit()
		console.log(chalk.red("Une erreur inconnu s'est produite.. : " + err)) && process.exit()
	})
}

// Obtenir des informations sur une IP
async function fetchinfo(ip){
	// Vérifier si l'IP est "valide"
	if(ip.includes("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"w"||"x"||"y"||"z")) return console.log(chalk.red("IP invalide : " + ip)) && process.exit()
	if(ip === "") return console.log(chalk.red("IP invalide...")) && process.exit()
	if(ip.replace(/\\n/g, "").replace(/ /g, "") === "") return console.log(chalk.red("IP invalide..")) && process.exit()

	// Donner l'IP
	console.log("IP : " + chalk.cyan(ip.replace(/\\n/g, "").replace(/ /g, "")))
	// Récuperer des informations
	var json = await fetch("http://api.ipstack.com/" + ip.replace(/\\n/g, "").replace(/ /g, "") + "?access_key=45c56bdfb6dc40bd27e69e61b7287839", { method: 'GET', follow: 20, size: 500000000})
	.then(res => res.json())
	.catch(err => {
		// En cas d'erreur
		if(err.code === "ENOTFOUND") return console.log(chalk.red("Erreur de réseau / de l'API (ipstack.com)...")) && process.exit()
		console.log(chalk.red("Une erreur inconnu s'est produite.. : " + err)) && process.exit()
	})

	// Regarder pour des erreurs
	if(json && json.success === false) return console.log(chalk.red("L'API a renvoyé une erreur... : " + json.error.info.replace(" [Technical Support: support@apilayer.com]",""))) && process.exit()

	// Donner d'autres informations
	if(json) console.log("Type : " + chalk.cyan(json.type))
	if(json) console.log("Adresse : " + chalk.cyan(`${json.zip} ${json.city}, ${json.region_name} (${json.region_code}), ${json.country_name} (${json.location.country_flag_emoji}), ${json.continent_name} (${json.continent_code})`))
	if(json) console.log("Adresse Google Maps : " + chalk.cyan("https://www.google.com/maps/@" + json.latitude + "," + json.longitude + ",200m/data=!3m1!1e3"))
	if(json) console.log("Language : " + chalk.cyan(json.location.languages[0].native + " (" + json.location.languages[0].code + ")"))
}
