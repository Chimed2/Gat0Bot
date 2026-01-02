const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { getUserData, removeBalance, updateUserData } = require('../../utils/economy');

const EDUCATION_LEVELS = [
    { name: "None", cost: 0 },
    { name: "Elementary School", cost: 500 },
    { name: "High School", cost: 2000 },
    { name: "College", cost: 10000 },
    { name: "University", cost: 50000 },
    { name: "PhD", cost: 200000 }
];

module.exports = {
    EDUCATION_LEVELS,
    data: new SlashCommandBuilder()
        .setName('school')
        .setDescription('Pay to upgrade your education level and unlock better jobs.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = getUserData(userId);
        const currentLevel = data.education || 0;

        if (currentLevel >= EDUCATION_LEVELS.length - 1) {
            return interaction.reply({ content: "🎓 You are already a genius! Max level reached.", ephemeral: true });
        }

        const nextLevel = EDUCATION_LEVELS[currentLevel + 1];
        const cost = nextLevel.cost;

        if (data.balance < cost) {
            return interaction.reply({ 
                content: `❌ You need **${cost} gat0bucks** to enroll in **${nextLevel.name}**. You have **${data.balance}**.`, 
                ephemeral: true 
            });
        }

        removeBalance(userId, cost);
        updateUserData(userId, { education: currentLevel + 1 });

        const embed = new EmbedBuilder()
            .setTitle('🎓 Enrollment Successful')
            .setDescription(`You graduated to **${nextLevel.name}**!`)
            .addFields({ name: 'Cost', value: `${cost} gat0bucks` })
            .setColor(Colors.Blue);

        await interaction.reply({ embeds: [embed] });
    },
};
