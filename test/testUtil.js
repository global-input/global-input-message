export function createInputReceivers(config = {}) {
    let inputs = null;
    let input = null;
    if (config.initData && config.initData.form && config.initData.form.fields) {
        inputs = config.initData.form.fields.map((field) => {
            field.operations = {
                onInput: () => { }
            };
            return createWaitForInputMessage(field.operations)
        }
        );
    }
    else {
        input = createWaitForInputMessage(config);
    }
    return { config, input, inputs };
}

const createPromise = (target) => {
    target.promise = new Promise((resolve, reject) => {
        target.resolve = resolve;
        target.reject = reject;
    });
};

function createWaitForInputMessage(target) {
    const input = {};

    createPromise(input);
    target.onInput = (message) => {
        input.resolve(message);
        createPromise(input);
    };
    input.get = () => input.promise;

    return input;
};

/**
 * compare initData to expectedInitData
 * @param {*} initData
 * @param {*} expectedInitData
 */


export function toBeSameInitData(received, expected) {
    if (!received) {
        return {
            pass: false,
            message: () => `action = "${expected.action}" is expected but received empty content instead`
        };
    }
    if (received.action !== expected.action) {
        return {
            pass: false,
            message: () => `action = "${expected.action}" is expected but received "${received.action}" instead`
        };
    }
    if (received.dataType !== expected.dataType) {
        return {
            pass: false,
            message: () => `dataType = "${expected.dataType}" is expected but received "${received.dataType}" instead`
        };
    }
    if (received.form.id !== expected.form.id) {
        return {
            pass: false,
            message: () => `form.id = "${expected.form.id}" is expected but received "${received.form.id}" instead`
        };
    }
    if (received.form.title !== expected.form.title) {
        return {
            pass: false,
            message: () => `form.title = "${expected.form.title}" is expected but received "${received.form.title}" instead`
        };
    }
    if (received.form.label !== expected.form.label) {
        return {
            pass: false,
            message: () => `form.label = "${expected.form.label}" is expected but received "${received.form.label}" instead`
        };
    }
    for (const [index, field] of expected.form.fields.entries()) {
        if (field.label !== received.form.fields[index].label) {
            return {
                pass: false,
                message: () => `form.fields[${index}].label = "${field.label}" is expected but received "${received.form.fields[index].label}" instead`
            };
        }
        if (field.id !== received.form.fields[index].id) {
            return {
                pass: false,
                message: () => `form.fields[${index}].id = "${field.id}" is expected but received "${received.form.fields[index].id}" instead`
            };
        }
        if (field.value !== received.form.fields[index].value) {
            return {
                pass: false,
                message: () => `form.fields[${index}].value = "${field.value}" is expected but received "${received.form.fields[index].value}" instead`
            };
        }
        if (field.nLines !== received.form.fields[index].nLines) {
            return {
                pass: false,
                message: () => `form.fields[${index}].nLines = "${field.nLines}" is expected but received "${received.form.fields[index].nLines}" instead`
            };
        }
    }

    return {
        pass: true,
        message: () => `received initData contains the same data as in the expected initData`
    };
}
