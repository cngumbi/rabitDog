const Rating = {
    render:(cons)=>{
        if(!cons.value){
            render `<div></div>`;
        }
        return `
        <div class="">
            <span>
                <i class="${
                    cons.value >= 1 ? 'bx bx-star' : cons.value >= 0.5 ? 'bx bx-star-half' : 'bx bx-star-fill'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 2 ? 'bx bx-star' : cons.value >= 1.5 ? 'bx bx-star-half' : 'bx bx-star-fill'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 3 ? 'bx bx-star' : cons.value >= 2.5 ? 'bx bx-star-half' : 'bx bx-star-fill'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 4 ? 'bx bx-star' : cons.value >= 3.5 ? 'bx bx-star-half' : 'bx bx-star-fill'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 5 ? 'bx bx-star' : cons.value >= 4.5 ? 'bx bx-star-half' : 'bx bx-star-fill'
                }"></i>
            </span>
            <span> ${cons.text || ''}</span>
        </div>
        `;
    },
};

export default Rating;