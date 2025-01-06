const tempRoleSchema = require('../Models/RoleRemove');

async function scheduleRoleRemove(client, UserId, RoleId, GuildId, ExpiresAt)
{
    const timeRemaining = ExpiresAt.getTime() - Date.now();

    setTimeout(async () =>{
        const guild = await client.guilds.cache.get(GuildId);
        const member = await guild.members.fetch(UserId);

        try{
            if(member.roles.cache.has(RoleId))
                {
                    await member.roles.remove(RoleId);
                }
        }
        catch(err)
        {
            console.error(err);
        }

        await tempRoleSchema.deleteOne({
            GuildId: GuildId,
            UserId: UserId,
            RoleId: RoleId,
        });
    }, timeRemaining)
}

module.exports = scheduleRoleRemove;