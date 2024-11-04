const { SlashCommandBuilder } = require('discord.js');
const util = require('../util.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('???'),
	async execute(interaction) {
		await util.random(interaction);
	},
};
