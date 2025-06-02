// src/utils/addressUtils.js

export const getComponent = (components, type) =>
    components.find(c => c.types.includes(type))?.long_name || null;

export const formatFullAddress = ({ streetNumber, street, city, state, postalCode, country }) =>
    `${streetNumber || ''} ${street || ''}, ${city || ''}, ${state || ''} ${postalCode || ''}, ${country || ''}`.trim();
