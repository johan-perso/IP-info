#!/usr/bin/env node

// Importer quelques modules
const fetch = require('node-fetch');
const chalk = require('chalk');
const ora = require('ora'); const spinner = ora('');
const updateNotifier = require('update-notifier');
const boxen = require('boxen');
const pkg = require('./package.json')

// Système de mise à jour
const notifierUpdate = updateNotifier({ pkg, updateCheckInterval: 10 });

if (notifierUpdate.update && pkg.version !== notifierUpdate.update.latest){
	// Afficher un message
	console.log(boxen("Mise à jour disponible " + chalk.dim(pkg.version) + chalk.reset(" → ") + chalk.green(notifierUpdate.update.latest) + "\n" + chalk.cyan("npm i -g " + pkg.name) + " pour mettre à jour", {
		padding: 1,
		margin: 1,
		align: 'center',
		borderColor: 'yellow',
		borderStyle: 'round'
	}))

	// Mettre une "notification" (bell)
	console.log('\u0007');
}
// Option pour afficher la page d'aide
if(process.argv.slice(2)[0] === "--help" || process.argv.slice(2)[0] === "-h") return console.log(`
 Utilisation
   $ ip-info

 Options
   --help -h                   Affiche cette liste
   --version -v                Indique la version actuellement utilisé

 Vérifier une IP
   $ ip-info 245.187.59.93
`)

// Option pour afficher la version
if(process.argv.slice(2)[0] === "--version" || process.argv.slice(2)[0] === "-v"){
	console.log("Votre IP-Info utilise actuellement la version " + chalk.cyan(pkg.version))
	console.log("\nGitHub : " + chalk.cyan("https://github.com/johan-perso/IP-info"))
	return process.exit()
}

// Appeler une des deux fonctions principal
if(process.argv.slice(2)[0]) fetchIp(process.argv.slice(2)[0], false)
if(!process.argv.slice(2)[0]) fetchMe()

// Obtenir sa propre IP
async function fetchMe(){
	// Dire qu'on récupère l'IP...
	spinner.text = "Récupération de votre IP...\n" + chalk.dim("(Faites CTRL+C pour annuler)")
	spinner.start()

	// Faire patienter trois secondes (au cas où tu fais la commande sans faire exprès t'as le time pour annuler)
	await new Promise(r => setTimeout(r, 3000));

	// Récuperer sa propre IP
    fetch('https://api.ipify.org?format=raw')
    .then(res => res.text())
    .then(data => {
		spinner.text = "Récupération de votre IP"
		spinner.stop()

		fetchIp(data, true)
	})
	.catch(err => {
		spinner.text = chalk.red("Erreur inconnue : ") + chalk.dim(err.toString().replace("FetchError: ","").replace("https://api.ipify.org/?format=raw"),"ipify")
		spinner.fail()

		process.exit()
	})
}

// Obtenir des informations sur une IP
async function fetchIp(ip, me){
	// Vérifier si l'IP est "valide"
	if(!ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) return console.log(chalk.red("L'IP n'est pas reconnu en tant qu'IP...")) && process.exit()
	if(!ip.replace(/\\n/g, "").replace(/ /g, "")) return console.log(chalk.red("Aucune IP trouvé")) && process.exit()

	// Dire qu'on récupère des informations
	spinner.text = "Récupération d'informations\n" + chalk.dim("(Faites CTRL+C pour annuler)")
	spinner.start()

	// Récuperer des informations sur l'IP
	var ipInfo = await fetch("http://api.ipstack.com/" + ip.replace(/\\n/g, "").replace(/ /g, "") + "?access_key=45c56bdfb6dc40bd27e69e61b7287839", { method: 'GET', follow: 20, size: 500000000})
	.then(res => res.json())
	.catch(err => { spinner.text = chalk.red("Erreur inconnue : ") + chalk.dim(err) && spinner.fail() && process.exit() })

	// Arrêter le spinner
    spinner.text = "Récupération de votre IP" && spinner.stop()

	// Afficher l'IP
	if(me) console.log(chalk.bold('Votre IP : ' + chalk.cyan(ip.replace(/\\n/g, "").replace(/ /g, ""))) + "\n")
	if(!me) console.log(chalk.bold('IP : ' + chalk.cyan(ip.replace(/\\n/g, "").replace(/ /g, ""))) + "\n")

	// Vérifier si aucune erreur n'a été trouvé
	if(ipInfo && ipInfo.success === false) return console.log(chalk.red("L'API a renvoyé une erreur... : " + ipInfo.error.info.replace(" [Technical Support: support@apilayer.com]",""))) && process.exit()
	if(ipInfo && ipInfo.city === null) return console.log(chalk.red("Aucune information n'a été trouvé")) && process.exit()

	// Donner d'autres informations
	console.log("Type : " + chalk.cyan(ipInfo.type.replace("ipv4","IPv4").replace("ipv6","IPv6")))
	console.log("Adresse : " + chalk.cyan(`${ipInfo.zip} ${ipInfo.city} (${ipInfo.region_name}), ${ipInfo.country_name} (${ipInfo.location.country_flag_emoji}), ${ipInfo.continent_name} (${ipInfo.continent_code})`))
	console.log("Adresse Google Maps : " + chalk.cyan("https://www.google.com/maps/@" + ipInfo.latitude + "," + ipInfo.longitude + ",200m/data=!3m1!1e3"))
	console.log("Language : " + chalk.cyan(ipInfo.location.languages[0].native + " (" + ipInfo.location.languages[0].code + ")"))
}
