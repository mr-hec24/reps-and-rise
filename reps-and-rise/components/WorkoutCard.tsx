import React from 'react';

interface WorkoutCardProps {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    onEdit: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
    name,
    sets,
    reps,
    weight,
    onEdit,
}) => {
    return (
        <div className="border rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-2">{name}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                    <p className="text-gray-600">Sets</p>
                    <p className="font-medium">{sets}</p>
                </div>
                <div>
                    <p className="text-gray-600">Reps</p>
                    <p className="font-medium">{reps}</p>
                </div>
                <div>
                    <p className="text-gray-600">Weight (lbs)</p>
                    <p className="font-medium">{weight}</p>
                </div>
            </div>
            <button
                onClick={onEdit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded"
            >
                Edit
            </button>
        </div>
    );
};