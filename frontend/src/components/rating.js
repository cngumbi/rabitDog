const Rating = {
    vingette: () => {},
    render:(cons)=>{
        if(!cons.value){
            return `<div></div>`;
        }
        return `
        <div class="rating">
            <span>
                <i class="${
                    cons.value >= 1 ? 'fa fa-star' : cons.value >= 0.5 ? 'fa fa-star-o-half' : 'fa fa-star-o'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 2 ? 'fa fa-star' : cons.value >= 1.5 ? 'fa fa-star-o-half' : 'fa fa-star-o'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 3 ? 'fa fa-star' : cons.value >= 2.5 ? 'fa fa-star-o-half' : 'fa fa-star-o'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 4 ? 'fa fa-star' : cons.value >= 3.5 ? 'fa fa-star-o-half' : 'fa fa-star-o'
                }"></i>
            </span>
            <span>
                <i class="${
                    cons.value >= 5 ? 'fa fa-star' : cons.value >= 4.5 ? 'fa fa-star-o-half' : 'fa fa-star-o'
                }"></i>
            </span>
            <span> ${cons.text || ''}</span>
        </div>
        `;
    },
};

export default Rating;