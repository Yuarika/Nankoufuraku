/*
 * ================================================================
 * 難攻不落 - Web Puzzle
 * game.js
 * ================================================================
 *
 * 操作
 *
 * ・縦 ↑↓
 *   4つのグループそのものの順番を変更
 *
 * ・横 ←→
 *   各グループ内の4つの選択肢を横方向へずらす
 *
 * ・文字・数字・絵文字
 *   ゲーム中も常に表示する。
 *
 * ・ENTER
 *   現在4つの枠に入っている内部選択を判定。
 *
 *   ENTERを押したときだけ
 *   選択された4つの文字を結果欄へ表示する。
 *
 * ・正解判定
 *   グループ単体では判定しない。
 *
 *   「4つのグループの順番」と
 *   「各グループで選択しているもの」が
 *   すべて正しい場合のみCLEAR。
 *
 * ================================================================
 */

"use strict";



/* ================================================================
 * Clear / X Settings
 * ================================================================ */

/*
 * 告知ポストのURL。
 *
 * まだ告知ポストが存在しない場合は空欄のままでOKです。
 *
 * 告知ポストを作成したら、ここへURLを入れてください。
 *
 * 例：
 *
 * const ANNOUNCEMENT_POST_URL =
 *     "https://x.com/yuarikaa/status/1234567890123456789";
 *
 *
 * 【URLが空欄の場合】
 *
 * 現在のWeb謎ページURLを含んだ
 * 通常のクリア投稿画面を開きます。
 *
 *
 * 【URLを設定した場合】
 *
 * 告知ポストのURLを含んだ
 * クリア投稿画面を開きます。
 *
 *
 * X側の仕様上、ブラウザから必ずネイティブの
 * 「引用ポスト」画面になることは保証されません。
 *
 * そのため、告知ポストURLを投稿内容に含める方式にしています。
 */

const ANNOUNCEMENT_POST_URL =
    "https://x.com/yuarikaa/status/2097612090353783190";



/*
 * 作者プロフィールURL
 */

const AUTHOR_PROFILE_URL =
    "https://yuarika.github.io/Yuarika_Profile/";



/* ================================================================
 * DOM
 * ================================================================ */

const board =
    document.getElementById("puzzleBoard");

const enterButton =
    document.getElementById("enterButton");

const resetButton =
    document.getElementById("resetButton");

const selectedPreview =
    document.getElementById("selectedPreview");

const result =
    document.getElementById("result");

const clearOverlay =
    document.getElementById("clearOverlay");

const clearTitle =
    document.getElementById("clearTitle");

const clearAnswer =
    document.getElementById("clearAnswer");

const clearReading =
    document.getElementById("clearReading");

const closeClearButton =
    document.getElementById("closeClearButton");

const xPostButton =
    document.getElementById("xPostButton");

const profileButton =
    document.getElementById("profileButton");



/* ================================================================
 * Puzzle Data
 * ================================================================ */
const PUZZLE_URL =
    "https://yuarika.github.io/Nankoufuraku/";
const PUZZLE_DATA = [

    /* ------------------------------------------------------------
     * 0 : 都道府県
     * ------------------------------------------------------------ */

    {
        key: "prefecture",

        name: "都道府県",

        items: [

            {
                id: "a7",
                text: "1",
                result: "都"
            },

            {
                id: "m2",
                text: "1",
                result: "道"
            },

            {
                id: "k9",
                text: "2",
                result: "府"
            },

            {
                id: "p4",
                text: "43",
                result: "県"
            }

        ]
    },



    /* ------------------------------------------------------------
     * 1 : 東西南北
     * ------------------------------------------------------------ */

    {
        key: "direction",

        name: "東西南北",

        items: [

            {
                id: "r3",
                text: "E",
                result: "東"
            },

            {
                id: "t8",
                text: "W",
                result: "西"
            },

            {
                id: "v1",
                text: "S",
                result: "南"
            },

            {
                id: "c6",
                text: "N",
                result: "北"
            }

        ]
    },



    /* ------------------------------------------------------------
     * 2 : 喜怒哀楽
     * ------------------------------------------------------------ */

    {
        key: "emotion",

        name: "喜怒哀楽",

        items: [

            {
                id: "h5",
                text: "😆",
                result: "喜"
            },

            {
                id: "d2",
                text: "😡",
                result: "怒"
            },

            {
                id: "s9",
                text: "😢",
                result: "哀"
            },

            {
                id: "l4",
                text: "😌",
                result: "楽"
            }

        ]
    },



    /* ------------------------------------------------------------
     * 3 : 士農工商
     * ------------------------------------------------------------ */

    {
        key: "class",

        name: "士農工商",

        items: [

            {
                id: "n7",
                text: "⚔️",
                result: "士"
            },

            {
                id: "b1",
                text: "🌾",
                result: "農"
            },

            {
                id: "g8",
                text: "🏭",
                result: "工"
            },

            {
                id: "x3",
                text: "🪙",
                result: "商"
            }

        ]
    }

];



/* ================================================================
 * Initial Item Order
 * ================================================================ */

const INITIAL_ITEM_ORDER = [

    /* group 0 : 都道府県 */
    [0, 1, 2, 3],

    /* group 1 : 東西南北 */
    [0, 1, 2, 3],

    /* group 2 : 喜怒哀楽 */
    [0, 1, 2, 3],

    /* group 3 : 士農工商 */
    [0, 1, 2, 3]

];



/* ================================================================
 * Validation
 * ================================================================ */

const VALIDATION_SALT =
    "YF-27-LOOP-2026";



const VALIDATION_TARGET =
    "9b1755c7da41a999fdd00a07ad7abb3d9b5dbd6526d3b16182cb1c43912b517e";



/* ================================================================
 * State
 * ================================================================ */

let groupOrder = [

    0,
    1,
    2,
    3

];



let itemOrder =
    createInitialItemOrder();



let horizontalOffset = [

    0,
    0,
    0,
    0

];



let isSolved =
    false;



let isSubmitting =
    false;



let isMovingGroup =
    false;



let isMovingItems =
    false;



/* ================================================================
 * Animation
 * ================================================================ */

const GROUP_MOVE_DURATION =
    320;



const ITEM_MOVE_DURATION =
    220;



/* ================================================================
 * Audio
 * ================================================================ */

let audioContext =
    null;



/* ================================================================
 * Initialization
 * ================================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        clearResult();


        if (selectedPreview) {

            selectedPreview.innerHTML =
                "";

        }


        buildBoard();

        updateEnterButton();



        /* --------------------------------------------------------
         * ENTER
         * -------------------------------------------------------- */

        enterButton.addEventListener(
            "click",
            submitAnswer
        );



        /* --------------------------------------------------------
         * RESET
         * -------------------------------------------------------- */

        resetButton.addEventListener(
            "click",
            function () {

                playButtonSound();

                resetGame();

            }
        );



        /* --------------------------------------------------------
         * CLOSE
         * -------------------------------------------------------- */

        closeClearButton.addEventListener(
            "click",
            function () {

                playButtonSound();

                closeClear();

            }
        );



        /* --------------------------------------------------------
         * X
         * -------------------------------------------------------- */

        if (xPostButton) {

            /*
             * 告知ポストURLが空欄でも
             * ボタンは無効化しない。
             *
             * 告知ポストがまだ存在しない場合は、
             * 現在のページURLを使って通常の
             * クリア投稿を作成する。
             */

            xPostButton.addEventListener(
                "click",
                function () {

                    if (xPostButton.disabled) {

                        return;

                    }


                    playButtonSound();



                    /* ==================================================
                     * 告知ポストURLが設定されている場合
                     * ================================================== */

                    if (ANNOUNCEMENT_POST_URL) {

                        /*
                         * 告知ポストURLを含めた
                         * クリア投稿画面を開く。
                         */

                        const postText =
                            "Web謎「難攻不落」をクリアしました！\n\n" +
                            "#Web_難攻不落";


                        const xUrl =
                            "https://x.com/intent/post?" +
                            "text=" +
                            encodeURIComponent(
                                postText
                            ) +
                            "&url=" +
                            encodeURIComponent(
                                ANNOUNCEMENT_POST_URL
                            );


                        window.open(
                            xUrl,
                            "_blank",
                            "noopener,noreferrer"
                        );


                        return;

                    }



                    /* ==================================================
                     * 告知ポストURLが空欄の場合
                     * ================================================== */

                    /*
                     * 告知ポストがまだない場合は、
                     * 現在のWeb謎ページURLを含めて
                     * 通常のクリア投稿を作成する。
                     */

                    const currentUrl =
    PUZZLE_URL;


                    const postText =
                        "Web謎「難攻不落」をクリアしました！\n\n" +
                        currentUrl +
                        "\n\n" +
                        "#Web_難攻不落";


                    const xUrl =
                        "https://x.com/intent/post?" +
                        "text=" +
                        encodeURIComponent(
                            postText
                        );


                    window.open(
                        xUrl,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

        }



        /* --------------------------------------------------------
         * 作者プロフィール
         * -------------------------------------------------------- */

        if (profileButton) {

            profileButton.addEventListener(
                "click",
                function () {

                    playButtonSound();


                    window.open(
                        AUTHOR_PROFILE_URL,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

        }

    }
);



/* ================================================================
 * Audio Context
 * ================================================================ */

function getAudioContext() {

    if (audioContext) {

        return audioContext;

    }



    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;



    if (!AudioContextClass) {

        return null;

    }



    audioContext =
        new AudioContextClass();



    return audioContext;

}



/* ================================================================
 * Resume Audio
 * ================================================================ */

function resumeAudio() {

    const ctx =
        getAudioContext();



    if (!ctx) {

        return null;

    }



    if (ctx.state === "suspended") {

        ctx.resume();

    }



    return ctx;

}



/* ================================================================
 * Tone
 * ================================================================ */

function playTone(
    frequency,
    duration,
    type,
    volume,
    delay
) {

    const ctx =
        resumeAudio();



    if (!ctx) {

        return;

    }



    const start =
        ctx.currentTime +
        (delay || 0);



    const oscillator =
        ctx.createOscillator();



    const gain =
        ctx.createGain();



    oscillator.type =
        type || "sine";



    oscillator.frequency.setValueAtTime(
        frequency,
        start
    );



    gain.gain.setValueAtTime(
        0.0001,
        start
    );



    gain.gain.exponentialRampToValueAtTime(
        Math.max(
            volume || 0.04,
            0.0002
        ),
        start + 0.008
    );



    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + duration
    );



    oscillator.connect(
        gain
    );



    gain.connect(
        ctx.destination
    );



    oscillator.start(
        start
    );



    oscillator.stop(
        start +
        duration +
        0.02
    );

}



/* ================================================================
 * Button Sound
 * ================================================================ */

function playButtonSound() {

    playTone(
        620,
        0.055,
        "square",
        0.025,
        0
    );

}



/* ================================================================
 * Enter Sound
 * ================================================================ */

function playEnterSound() {

    playTone(
        480,
        0.07,
        "square",
        0.025,
        0
    );



    playTone(
        720,
        0.09,
        "square",
        0.022,
        0.075
    );

}



/* ================================================================
 * Wrong Sound
 * ================================================================ */

function playWrongSound() {

    playTone(
        180,
        0.10,
        "sawtooth",
        0.022,
        0
    );



    playTone(
        135,
        0.13,
        "sawtooth",
        0.018,
        0.09
    );

}



/* ================================================================
 * Clear Sound
 * ================================================================ */

function playClearSound() {

    playTone(
        523.25,
        0.12,
        "sine",
        0.045,
        0
    );



    playTone(
        659.25,
        0.12,
        "sine",
        0.045,
        0.13
    );



    playTone(
        783.99,
        0.16,
        "sine",
        0.05,
        0.26
    );



    playTone(
        1046.50,
        0.34,
        "sine",
        0.055,
        0.42
    );

}



/* ================================================================
 * Build Board
 * ================================================================ */

function buildBoard() {

    board.innerHTML =
        "";



    for (
        let displayIndex = 0;
        displayIndex < groupOrder.length;
        displayIndex++
    ) {

        const groupIndex =
            groupOrder[displayIndex];



        const group =
            PUZZLE_DATA[groupIndex];



        const groupElement =
            document.createElement(
                "div"
            );



        groupElement.className =
            "puzzle-group";



        groupElement.dataset.groupIndex =
            String(groupIndex);



        groupElement.dataset.displayIndex =
            String(displayIndex);



        /* ========================================================
         * Header
         * ======================================================== */

        const groupHeader =
            document.createElement(
                "div"
            );



        groupHeader.className =
            "group-header";



        const orderNumber =
            document.createElement(
                "div"
            );



        orderNumber.className =
            "group-number";



        orderNumber.textContent =
            String(
                displayIndex + 1
            );



        const orderArea =
            document.createElement(
                "div"
            );



        orderArea.className =
            "group-name-area";



        const orderText =
            document.createElement(
                "div"
            );



        orderText.className =
            "order-text";



        /*
         * グループ名は表示しない。
         */

        orderText.textContent =
            "GROUP";



        orderArea.appendChild(
            orderText
        );



        /* ========================================================
         * Vertical Controls
         * ======================================================== */

        const moveControls =
            document.createElement(
                "div"
            );



        moveControls.className =
            "move-controls";



        /* --------------------------------------------------------
         * UP
         * -------------------------------------------------------- */

        const upButton =
            document.createElement(
                "button"
            );



        upButton.type =
            "button";



        upButton.className =
            "move-button";



        upButton.textContent =
            "↑";



        upButton.title =
            "上へ移動";



        upButton.setAttribute(
            "aria-label",
            "上へ移動"
        );



        upButton.disabled =
            displayIndex === 0 ||
            isMovingGroup ||
            isMovingItems ||
            isSolved ||
            isSubmitting;



        upButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();



                if (upButton.disabled) {

                    return;

                }



                playButtonSound();



                moveGroupAnimated(
                    displayIndex,
                    -1
                );

            }
        );



        /* --------------------------------------------------------
         * DOWN
         * -------------------------------------------------------- */

        const downButton =
            document.createElement(
                "button"
            );



        downButton.type =
            "button";



        downButton.className =
            "move-button";



        downButton.textContent =
            "↓";



        downButton.title =
            "下へ移動";



        downButton.setAttribute(
            "aria-label",
            "下へ移動"
        );



        downButton.disabled =
            displayIndex ===
            groupOrder.length - 1 ||
            isMovingGroup ||
            isMovingItems ||
            isSolved ||
            isSubmitting;



        downButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();



                if (downButton.disabled) {

                    return;

                }



                playButtonSound();



                moveGroupAnimated(
                    displayIndex,
                    1
                );

            }
        );



        moveControls.appendChild(
            upButton
        );



        moveControls.appendChild(
            downButton
        );



        groupHeader.appendChild(
            orderNumber
        );



        groupHeader.appendChild(
            orderArea
        );



        groupHeader.appendChild(
            moveControls
        );



        /* ========================================================
         * Choice Area
         * ======================================================== */

        const choiceArea =
            document.createElement(
                "div"
            );



        choiceArea.className =
            "choice-area";



        /* ========================================================
         * Left Button
         * ======================================================== */

        const leftButton =
            document.createElement(
                "button"
            );



        leftButton.type =
            "button";



        leftButton.className =
            "item-move-button item-move-left";



        leftButton.textContent =
            "←";



        leftButton.title =
            "左へ移動";



        leftButton.setAttribute(
            "aria-label",
            "左へ移動"
        );



        leftButton.disabled =
            horizontalOffset[groupIndex] <= 0 ||
            isMovingGroup ||
            isMovingItems ||
            isSolved ||
            isSubmitting;



        leftButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();



                if (leftButton.disabled) {

                    return;

                }



                playButtonSound();



                moveItemsAnimated(
                    groupIndex,
                    -1
                );

            }
        );



        choiceArea.appendChild(
            leftButton
        );



        /* ========================================================
         * Fixed Selection Window
         * ======================================================== */

        const selectionWindow =
            document.createElement(
                "div"
            );



        selectionWindow.className =
            "selection-window";



        const selectedDisplay =
            document.createElement(
                "div"
            );



        selectedDisplay.className =
            "selected-item";



        const selectedItem =
            getCurrentSelectedItem(
                groupIndex
            );



        if (selectedItem) {

            selectedDisplay.textContent =
                selectedItem.text;

        }



        selectionWindow.appendChild(
            selectedDisplay
        );



        choiceArea.appendChild(
            selectionWindow
        );



        /* ========================================================
         * Right Button
         * ======================================================== */

        const rightButton =
            document.createElement(
                "button"
            );



        rightButton.type =
            "button";



        rightButton.className =
            "item-move-button item-move-right";



        rightButton.textContent =
            "→";



        rightButton.title =
            "右へ移動";



        rightButton.setAttribute(
            "aria-label",
            "右へ移動"
        );



        rightButton.disabled =
            horizontalOffset[groupIndex] >= 3 ||
            isMovingGroup ||
            isMovingItems ||
            isSolved ||
            isSubmitting;



        rightButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();



                if (rightButton.disabled) {

                    return;

                }



                playButtonSound();



                moveItemsAnimated(
                    groupIndex,
                    1
                );

            }
        );



        choiceArea.appendChild(
            rightButton
        );



        /* ========================================================
         * Append
         * ======================================================== */

        groupElement.appendChild(
            groupHeader
        );



        groupElement.appendChild(
            choiceArea
        );



        board.appendChild(
            groupElement
        );

    }

}



/* ================================================================
 * Move Group - Animated
 * ================================================================ */

function moveGroupAnimated(
    displayIndex,
    direction
) {

    if (
        isSolved ||
        isSubmitting ||
        isMovingGroup ||
        isMovingItems
    ) {

        return;

    }



    const targetIndex =
        displayIndex +
        direction;



    if (
        targetIndex < 0 ||
        targetIndex >= groupOrder.length
    ) {

        return;

    }



    const groupElements =
        board.querySelectorAll(
            ".puzzle-group"
        );



    if (
        groupElements.length !==
        groupOrder.length
    ) {

        return;

    }



    const movingElement =
        groupElements[displayIndex];



    const targetElement =
        groupElements[targetIndex];



    if (
        !movingElement ||
        !targetElement
    ) {

        return;

    }



    isMovingGroup =
        true;



    board.classList.add(
        "is-moving"
    );



    setAllMoveButtonsDisabled(
        true
    );



    const movingRect =
        movingElement.getBoundingClientRect();



    const targetRect =
        targetElement.getBoundingClientRect();



    const distance =
        targetRect.top -
        movingRect.top;



    movingElement.style.transform =
        "translateY(" +
        distance +
        "px)";



    targetElement.style.transform =
        "translateY(" +
        (-distance) +
        "px)";



    setTimeout(
        function () {

            const temporary =
                groupOrder[displayIndex];



            groupOrder[displayIndex] =
                groupOrder[targetIndex];



            groupOrder[targetIndex] =
                temporary;



            isMovingGroup =
                false;



            board.classList.remove(
                "is-moving"
            );



            buildBoard();

            updateEnterButton();

        },
        GROUP_MOVE_DURATION
    );

}



/* ================================================================
 * Move Items - Animated
 * ================================================================ */

function moveItemsAnimated(
    groupIndex,
    direction
) {

    if (
        isSolved ||
        isSubmitting ||
        isMovingGroup ||
        isMovingItems
    ) {

        return;

    }



    const currentOrder =
        itemOrder[groupIndex];



    if (
        !currentOrder ||
        currentOrder.length !== 4
    ) {

        return;

    }



    const currentOffset =
        horizontalOffset[groupIndex];



    const nextOffset =
        currentOffset +
        direction;



    if (
        nextOffset < 0 ||
        nextOffset > 3
    ) {

        return;

    }



    isMovingItems =
        true;



    board.classList.add(
        "is-moving-items"
    );



    setAllMoveButtonsDisabled(
        true
    );



    const groupElement =
        board.querySelector(
            '.puzzle-group[data-group-index="' +
            groupIndex +
            '"]'
        );



    if (!groupElement) {

        isMovingItems =
            false;



        board.classList.remove(
            "is-moving-items"
        );



        setAllMoveButtonsDisabled(
            false
        );



        return;

    }



    const selectedDisplay =
        groupElement.querySelector(
            ".selected-item"
        );



    if (!selectedDisplay) {

        isMovingItems =
            false;



        board.classList.remove(
            "is-moving-items"
        );



        setAllMoveButtonsDisabled(
            false
        );



        return;

    }



    selectedDisplay.classList.add(
        "is-item-moving"
    );



    setTimeout(
        function () {

            horizontalOffset[groupIndex] =
                nextOffset;



            isMovingItems =
                false;



            board.classList.remove(
                "is-moving-items"
            );



            clearResult();



            buildBoard();

            updateEnterButton();

        },
        ITEM_MOVE_DURATION
    );

}



/* ================================================================
 * Set All Move Buttons Disabled
 * ================================================================ */

function setAllMoveButtonsDisabled(
    disabled
) {

    const buttons =
        document.querySelectorAll(
            ".move-button, .item-move-button"
        );



    buttons.forEach(
        function (button) {

            if (disabled) {

                button.disabled =
                    true;



                return;

            }



            const groupElement =
                button.closest(
                    ".puzzle-group"
                );



            if (!groupElement) {

                return;

            }



            const displayIndex =
                Number(
                    groupElement.dataset.displayIndex
                );



            /* ----------------------------------------------------
             * 左
             * ---------------------------------------------------- */

            if (
                button.classList.contains(
                    "item-move-left"
                )
            ) {

                const groupIndex =
                    Number(
                        groupElement.dataset.groupIndex
                    );



                button.disabled =
                    horizontalOffset[groupIndex] <= 0 ||
                    isSolved ||
                    isSubmitting ||
                    isMovingGroup ||
                    isMovingItems;



                return;

            }



            /* ----------------------------------------------------
             * 右
             * ---------------------------------------------------- */

            if (
                button.classList.contains(
                    "item-move-right"
                )
            ) {

                const groupIndex =
                    Number(
                        groupElement.dataset.groupIndex
                    );



                button.disabled =
                    horizontalOffset[groupIndex] >= 3 ||
                    isSolved ||
                    isSubmitting ||
                    isMovingGroup ||
                    isMovingItems;



                return;

            }



            /* ----------------------------------------------------
             * 上下
             * ---------------------------------------------------- */

            const isUp =
                button.textContent ===
                "↑";



            if (isUp) {

                button.disabled =
                    displayIndex === 0 ||
                    isSolved ||
                    isSubmitting ||
                    isMovingGroup ||
                    isMovingItems;

            } else {

                button.disabled =
                    displayIndex ===
                    groupOrder.length - 1 ||
                    isSolved ||
                    isSubmitting ||
                    isMovingGroup ||
                    isMovingItems;

            }

        }
    );

}



/* ================================================================
 * Get Current Selected Item Index
 * ================================================================ */

function getCurrentSelectedItemIndex(
    groupIndex
) {

    const order =
        itemOrder[groupIndex];



    if (
        !order ||
        order.length !== 4
    ) {

        return null;

    }



    const offset =
        horizontalOffset[groupIndex];



    if (
        offset < 0 ||
        offset >= order.length
    ) {

        return null;

    }



    return order[offset];

}



/* ================================================================
 * Get Current Selected Item
 * ================================================================ */

function getCurrentSelectedItem(
    groupIndex
) {

    const itemIndex =
        getCurrentSelectedItemIndex(
            groupIndex
        );



    if (
        itemIndex === null ||
        itemIndex === undefined
    ) {

        return null;

    }



    return PUZZLE_DATA[groupIndex]
        .items[itemIndex];

}



/* ================================================================
 * Preview
 * ================================================================ */

function updatePreview() {

    if (!selectedPreview) {

        return;

    }



    selectedPreview.innerHTML =
        "";

}



/* ================================================================
 * Enter Button
 * ================================================================ */

function updateEnterButton() {

    enterButton.disabled =
        isSolved ||
        isSubmitting ||
        isMovingGroup ||
        isMovingItems;

}



/* ================================================================
 * Signature
 * ================================================================ */

function buildSignature() {

    const parts =
        [];



    for (
        let displayIndex = 0;
        displayIndex < groupOrder.length;
        displayIndex++
    ) {

        const groupIndex =
            groupOrder[displayIndex];



        const itemIndex =
            getCurrentSelectedItemIndex(
                groupIndex
            );



        if (
            itemIndex === null ||
            itemIndex === undefined
        ) {

            return "";

        }



        const item =
            PUZZLE_DATA[groupIndex]
                .items[itemIndex];



        parts.push(
            String(groupIndex),
            String(itemIndex),
            item.id
        );

    }



    return parts.join(":");

}



/* ================================================================
 * SHA-256
 * ================================================================ */

async function sha256(
    text
) {

    const encoder =
        new TextEncoder();



    const data =
        encoder.encode(
            text
        );



    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );



    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );



    return hashArray
        .map(
            function (byte) {

                return byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    );

            }
        )
        .join("");

}



/* ================================================================
 * Validate
 * ================================================================ */

async function validateAnswer() {

    const signature =
        buildSignature();



    if (!signature) {

        return false;

    }



    let value =
        VALIDATION_SALT +
        signature;



    for (
        let i = 0;
        i < 3;
        i++
    ) {

        value =
            await sha256(
                value
            );

    }



    return (
        value ===
        VALIDATION_TARGET
    );

}



/* ================================================================
 * Submit Answer
 * ================================================================ */

async function submitAnswer() {

    if (
        isSolved ||
        isSubmitting ||
        isMovingGroup ||
        isMovingItems
    ) {

        return;

    }



    isSubmitting =
        true;



    updateEnterButton();



    playEnterSound();



    result.className =
        "result result-checking";



    result.innerHTML =
        "<span>CHECKING...</span>";



    try {

        await wait(
            350
        );



        let correct =
            false;



        try {

            correct =
                await validateAnswer();

        } catch (error) {

            console.error(
                "Answer validation error:",
                error
            );



            correct =
                false;

        }



        showSymbolResult();



        if (correct) {

            handleClear();

        } else {

            handleWrong();

        }

    } finally {

        isSubmitting =
            false;



        updateEnterButton();

    }

}



/* ================================================================
 * Get Selected Symbols
 * ================================================================ */

function getSelectedSymbols() {

    const symbols =
        [];



    for (
        let displayIndex = 0;
        displayIndex < groupOrder.length;
        displayIndex++
    ) {

        const groupIndex =
            groupOrder[displayIndex];



        const itemIndex =
            getCurrentSelectedItemIndex(
                groupIndex
            );



        if (
            itemIndex === null ||
            itemIndex === undefined
        ) {

            symbols.push(
                "—"
            );



            continue;

        }



        symbols.push(
            PUZZLE_DATA[groupIndex]
                .items[itemIndex]
                .text
        );

    }



    return symbols;

}



/* ================================================================
 * Show Symbol Result
 * ================================================================ */

function showSymbolResult() {

    const symbols =
        getSelectedSymbols();



    result.innerHTML =
        '<span class="decoded-result">' +
        symbols
            .map(
                escapeHtml
            )
            .join("　") +
        "</span>" +
        "<small>選択した4つ</small>";

}



/* ================================================================
 * Clear Result
 * ================================================================ */

function clearResult() {

    if (!result) {

        return;

    }



    result.className =
        "result";



    result.innerHTML =
        "";

}



/* ================================================================
 * Wrong
 * ================================================================ */

function handleWrong() {

    result.className =
        "result result-wrong";



    playWrongSound();



    board.classList.add(
        "board-error"
    );



    setTimeout(
        function () {

            board.classList.remove(
                "board-error"
            );

        },
        650
    );

}



/* ================================================================
 * Clear
 * ================================================================ */

function handleClear() {

    isSolved =
        true;



    /*
     * CLEAR画面では
     * 選択中のアルファベット・数字・絵文字を
     * 表示しない。
     *
     * 大きく「難攻不落」を表示する。
     */

    if (clearTitle) {

        clearTitle.textContent =
            "難攻不落";

    }



    if (clearAnswer) {

        clearAnswer.textContent =
            "CLEAR";

    }



    if (clearReading) {

        clearReading.textContent =
            "PUZZLE COMPLETE";

    }



    result.className =
        "result result-clear";



    result.innerHTML =
        '<span class="decoded-result">' +
        "CLEAR" +
        "</span>" +
        "<small>PUZZLE CLEARED</small>";



    board.classList.add(
        "board-clear"
    );



    playClearSound();



    setTimeout(
        function () {

            clearOverlay.classList.add(
                "show"
            );



            clearOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

        },
        500
    );

}



/* ================================================================
 * Escape HTML
 * ================================================================ */

function escapeHtml(
    text
) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* ================================================================
 * Reset
 * ================================================================ */

function resetGame() {

    if (
        isSubmitting ||
        isMovingGroup ||
        isMovingItems
    ) {

        return;

    }



    isSolved =
        false;



    isMovingGroup =
        false;



    isMovingItems =
        false;



    horizontalOffset = [

        0,
        0,
        0,
        0

    ];



    groupOrder = [

        0,
        1,
        2,
        3

    ];



    itemOrder =
        createInitialItemOrder();



    clearResult();



    if (selectedPreview) {

        selectedPreview.innerHTML =
            "";

    }



    board.classList.remove(
        "board-clear"
    );



    board.classList.remove(
        "board-error"
    );



    board.classList.remove(
        "is-moving"
    );



    board.classList.remove(
        "is-moving-items"
    );



    clearOverlay.classList.remove(
        "show"
    );



    clearOverlay.setAttribute(
        "aria-hidden",
        "true"
    );



    buildBoard();



    updateEnterButton();

}



/* ================================================================
 * Close Clear
 * ================================================================ */

function closeClear() {

    clearOverlay.classList.remove(
        "show"
    );



    clearOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

}



/* ================================================================
 * Create Initial Item Order
 * ================================================================ */

function createInitialItemOrder() {

    return [

        INITIAL_ITEM_ORDER[0].slice(),

        INITIAL_ITEM_ORDER[1].slice(),

        INITIAL_ITEM_ORDER[2].slice(),

        INITIAL_ITEM_ORDER[3].slice()

    ];

}



/* ================================================================
 * Wait
 * ================================================================ */

function wait(
    milliseconds
) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}
