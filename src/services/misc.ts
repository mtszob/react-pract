export function getDeepAttribute(obj: any, attributeChain: string) {
    let currentAttribute = obj;
    const attributes = attributeChain.split('.');

    attributes.forEach(attribute => {
        if (currentAttribute === undefined) return;
        currentAttribute = currentAttribute[attribute];
    });

    return currentAttribute;
}