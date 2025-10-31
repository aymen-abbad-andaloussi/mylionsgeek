<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Computer;
use App\Models\User;
use App\Http\Controllers\ComputersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::middleware(['auth','role:admin'])->group(function () {
    Route::get('/admin/computers', function () {
        $computers = Computer::with('user')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'mark' => $c->mark,
                'reference' => $c->reference,
                'cpu' => $c->cpu,
                'gpu' => $c->gpu,
                'isBroken' => $c->state !== 'working',
                'assignedUserId' => $c->user_id,
                'contractStart' => optional($c->start)->toDateString(),
                'contractEnd' => optional($c->end)->toDateString(),
            ];
        });

        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/computers/index', [
            'computers' => $computers,
            'users' => $users,
        ]);
    })->name('admin.computers');

    Route::get('/admin/computers/{id}', function (string $id) {
        $computer = Computer::with('user')->findOrFail($id);
        return Inertia::render('admin/computers/[id]', [
            'computer' => $computer,
        ]);
    })->name('admin.computers.show');

    // Create new computer
    Route::post('/admin/computers', [ComputersController::class, 'store'])
        ->name('admin.computers.store');

    // Update existing computer
    Route::put('/admin/computers/{computer}', [ComputersController::class, 'update'])
        ->name('admin.computers.update');
    
    Route::get('/admin/computers/{computer}/contract', [ComputersController::class, 'computerStartContract'])
    ->name('computers.contract');
    Route::delete('/admin/computers/{computer}', [ComputersController::class, 'destroy'])->name('admin.computers.destroy');

    // History endpoint for modal - combined from activity_log and computer_histories
    Route::get('/admin/computers/{computer}/history', function (Request $request, Computer $computer) {
        $activityHistory = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('activity_log')) {
            $rows = DB::table('activity_log as al')
                ->leftJoin('users as u', 'u.id', '=', 'al.causer_id')
                ->where('al.log_name', 'computer')
                ->where('al.description', 'computer history')
                ->where('al.subject_type', 'App\\Models\\Computer')
                ->where('al.subject_id', $computer->id)
                ->where('al.event', 'assigned')
                ->orderByDesc('al.created_at')
                ->limit(1000)
                ->get();

            $activityHistory = $rows->map(function ($row) {
                $props = json_decode($row->properties ?? '{}', true);
                $start = $props['start'] ?? null;
                $end = $props['end'] ?? null;
                return [
                    'id' => 'act_' . $row->id,
                    'user' => $row->causer_id ? [
                        'id' => $row->causer_id,
                        'name' => $row->name ?? null,
                        'email' => $row->email ?? null,
                    ] : null,
                    'start' => $start ? (new \Carbon\Carbon($start))->format('d-m-Y') : null,
                    'end' => ($end !== null && $end !== '') ? (new \Carbon\Carbon($end))->format('d-m-Y') : null,
                ];
            });
        }

        $tableHistory = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('computer_histories')) {
            $tableRows = DB::table('computer_histories as ch')
                ->leftJoin('users as u', 'u.id', '=', 'ch.user_id')
                ->where('ch.computer_id', $computer->id)
                ->orderByDesc('ch.start')
                ->limit(1000)
                ->get();

            $tableHistory = $tableRows->map(function ($row) {
                return [
                    'id' => 'tbl_' . $row->id,
                    'user' => $row->user_id ? [
                        'id' => $row->user_id,
                        'name' => $row->name ?? null,
                        'email' => $row->email ?? null,
                    ] : null,
                    'start' => $row->start ? (new \Carbon\Carbon($row->start))->format('d-m-Y') : null,
                    'end' => $row->end ? (new \Carbon\Carbon($row->end))->format('d-m-Y') : null,
                ];
            });
        }

        $combined = $activityHistory->merge($tableHistory)
            ->filter(function ($h) { return $h['start'] !== null; })
            ->values();

        // Ensure current assignment appears as an open row if not already present
        if ($computer->user_id) {
            $hasOpenForCurrent = $combined->contains(function ($h) use ($computer) {
                return $h['user'] && ($h['user']['id'] === $computer->user_id) && ($h['end'] === null);
            });

            if (!$hasOpenForCurrent) {
                $user = DB::table('users')->select('id','name','email')->where('id', $computer->user_id)->first();
                $startDate = $computer->start ? (new \Carbon\Carbon($computer->start))->format('d-m-Y') : now()->format('d-m-Y');
                $combined->push([
                    'id' => 'cur_' . $computer->id,
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ] : [
                        'id' => $computer->user_id,
                        'name' => null,
                        'email' => null,
                    ],
                    'start' => $startDate,
                    'end' => null,
                ]);
            }
        }

        $combined = $combined->sortByDesc(function ($h) { return $h['start']; })->values();

        return response()->json(['history' => $combined]);
    })->name('admin.computers.history');

});


