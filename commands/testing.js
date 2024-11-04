const { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const util = require('../util.js')
const { DateTime } = require("luxon");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newtest')
		.setDescription('???'),
	async execute(interaction) {
		roleName = 'Santa\'s little helper ' + DateTime.now().setZone("America/Los_Angeles").year
        interaction.guild.roles.create({
              name: roleName
          }).then(console.log)
          .catch(console.error);
		  const role = interaction.guild.roles.cache.find(role => role.name === roleName);
		  const member = interaction.member
		  await member.roles.add(role)
		
		interaction.reply("lol this is broken")
	},
};
