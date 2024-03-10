import { SET_EQUIPMENTS } from "constants/bmdashboard/equipmentsConstants"

const defaultState = {
    equipmentslist: [],
    updateEquipments: {
        loading: false,
        result: null,
        error: undefined
    },
    updateEquipmentsBulk: {
        loading: false,
        result: null,
        error: undefined
    }
}

export const equipmentsReducer = (equipments = defaultState, action) => {
    switch (action.type) {
        case SET_EQUIPMENTS:
            {
                equipments.equipmentslist = action.payload;
                return {
                    ...equipments, updateEquipments: { ...defaultState.updateEquipments },
                    updateEquipmentsBulk: { ...defaultState.updateEquipmentsBulk }
                }
            }
        default:
            return equipments;
    }
}