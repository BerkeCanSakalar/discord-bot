const tempRoleSchema = require('../Models/RoleAdd');

async function scheduleRoleAdd(client, UserId, RoleId, GuildId, ExpiresAt)
{
    const timeRemaining = ExpiresAt.getTime() - Date.now();

    setTimeout(async () =>{
        const guild = await client.guilds.cache.get(GuildId);
        const member = await guild.members.fetch(UserId);

        if(member)
            {
                await member.roles.add(RoleId, "Geçici rol kaldırma süresi doldu")
            }

        await tempRoleSchema.findOneAndDelete({
            GuildId: GuildId,
            UserId: UserId,
            RoleId: RoleId,
        });
    }, timeRemaining);
}

module.exports = scheduleRoleAdd;