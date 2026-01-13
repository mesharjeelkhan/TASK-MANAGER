export const validateEmail = (email) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    export const addThousandsSeparator = (num) => {
        if (num == null || isNaN(num)) return "";
    
    const [integerPart, fractionalParts] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g,",");

    return fractionalParts
    ?`${formattedInteger}.${fractionalParts}`
    : formattedInteger;
    }