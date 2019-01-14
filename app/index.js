const $app = document.querySelector('.app');

function dom(type, props, ...children) {
    return {type, props, children};
}

function generateDom(domObj) {
    let el;

    if (domObj.type) {
        el = document.createElement(domObj.type);
    } else {
        el = document.createTextNode(domObj);
    }

    if (domObj.props) {
        Object.keys(domObj.props).forEach((key) => {
            el.setAttribute(key, domObj.props[key]);
        });
    }

    if (domObj.children) {
        domObj.children.forEach(child => el.appendChild(generateDom(child)));
    }

    return el;
}

const types = {
    get: type => Object.prototype.toString.call(type),
    string: '[object String]',
    number: '[object Number]',
    array: '[object Array]',
    object: '[object Object]',
    function: '[object Function]',
    null: '[object Null]',
    undefined: '[object Undefined]',
    boolean: '[object Boolean]',
};

function isObjChanged(obj1, obj2) {
    // Different data types
    if (types.get(obj1) !== types.get(obj2)) {
        return true;
    }

    // Diff objects
    if (types.get(obj1) === types.object) {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj1);

        if (obj1Keys.length !== obj2Keys.length) {
            return true;
        }

        // Empty object as no change
        if (obj1Keys.length === 0) {
            return false;
        }

        // Compare each item of objects
        for (let i = 0; i < obj1Keys.length; i++) {
            let key = obj1Keys[i];

            if (obj1[key] !== obj2[key]) {
                return true;
            }
        }
    }

    return false;
}

function isNodeChanged(dom1, dom2) {
    if (types.get(dom1) === types.object && types.get(dom2) === types.object) {
        if (!isObjChanged(dom1.type, dom2.type) && !isObjChanged(dom1.props, dom2.props)
        ) {
            return false;
        } else {
            return true;
        }
    }

    return dom1 !== dom2;
}

function isNodeChanged2(dom1, dom2) {
    if (types.get(dom1) === types.object && types.get(dom2) === types.object) {
        return dom1.type !== dom2.type;
    }

    return dom1 !== dom2;
}

function updateState($parent, oldNode, newNode, index = 0) {
    // Clear empty text node
    if ($parent.childNodes.length === 1 &&

        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        $parent.childNodes[0].nodeType === 3 &&
        $parent.childNodes[0].data.trim() === ''
    ) {
        $parent.removeChild($parent.childNodes[0]);
    }

    const $currentNode = $parent.childNodes[index];

    // No new node, remove old node
    if (!newNode) {
        return $parent.removeChild($currentNode);
    }

    // No old node, append newNode
    if (!oldNode) {
        return $parent.appendChild(generateDom(newNode));
    }

    // node.type or string change
    if (isNodeChanged2(oldNode, newNode)) {
        return $parent.replaceChild(
            generateDom(newNode),
            $currentNode
        );
    }

    // old and new are the same string
    if (oldNode === newNode) {
        return;
    }

    // prop change
    if (isObjChanged(oldNode.props, newNode.props)) {
        const oldProps = oldNode.props || {};
        const newProps = newNode.props || {};
        const oldPropsKeys = Object.keys(oldProps);
        const newPropsKeys = Object.keys(newProps);

        // New props is null, delete all old.
        if (newPropsKeys.length === 0) {
            oldPropsKeys.forEach((prop) => {
                $currentNode.removeAttribute(prop);
            });
        } else {
            const allPropsKeys = new Set([...oldPropsKeys, ...newPropsKeys]);

            allPropsKeys.forEach((prop) => {
                // No old prop, set new
                if (oldProps[prop] === undefined ) {
                    return $currentNode.setAttribute(prop, newProps[prop]);
                }

                // No new prop, remove old.
                if (newProps[prop] === undefined) {
                    return $currentNode.removeAttribute(prop);
                }

                // Diff value
                if (oldProps[prop] !== newProps[prop]) {
                    return $currentNode.setAttribute(prop, newProps[prop]);
                }
            });
        }
    }

    // diff children.
    if ((oldNode.children && oldNode.children.length)
        || (newNode.children && newNode.children.length)
    ) {
        let maxLength = Math.max.apply(
            null,
            [oldNode.children.length,
            newNode.children.length]
        );

        for (let i = 0; i < maxLength; i++) {
            updateState(
                $currentNode,
                oldNode.children[i],
                newNode.children[i],
                i
            );
        }
    }
}

const activeProfile = <div>
    <div class="profile" id="profile">
    </div>
</div>;

const inactiveProfile = <div>
    <div class="profile" data-user-name="Tonni">
    </div>
</div>;

updateState($app, null, activeProfile);

const $updateDom = document.querySelector('.update-dom');

$updateDom.addEventListener('click', (e) => {
    updateState($app, activeProfile, inactiveProfile);
});
