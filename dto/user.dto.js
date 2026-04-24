

export const updateProfileDTO = (body) => {
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;

    return updates;
};