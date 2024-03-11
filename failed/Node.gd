extends Node;

func quit_program () -> void:
	# 0.03 seconds is enough for this task.
	print('Terminating daemon');
	await get_tree().create_timer(0.2).timeout;
	get_tree().quit();

func delete_files(file:String) -> void:
	DirAccess.remove_absolute(screenshot_directory_path_absolute +"/"+file)

const home_directory_path: String = "user://";

const screenshot_directory_name: String = "screenshots";
const screenshot_directory_path: String = home_directory_path + screenshot_directory_name;
var screenshot_directory_path_absolute: String = ProjectSettings.globalize_path(screenshot_directory_path);

const ocrOutput_file_name: String = "ocrOutput.txt";
const ocrOutput_file_path: String = home_directory_path + ocrOutput_file_name; 

# Called when the node enters the scene tree for the first time.
func _ready() -> void:

	print('Starting daemon');
	#display directory of project
	#print("User data directory: "+ OS.get_user_data_dir());
	print("User data directory: "+ ProjectSettings.globalize_path(home_directory_path));
	
	# check if dir exist. create if not
	# if exist get all files in directory and delete it
	if DirAccess.dir_exists_absolute(screenshot_directory_path_absolute):
		var screenshots_files_list: Array = DirAccess.get_files_at(screenshot_directory_path);
		if !screenshots_files_list.is_empty():
			screenshots_files_list.map(delete_files);	
	else:
		var home_directory: DirAccess = DirAccess.open(home_directory_path);
		var make_dir_result: Error = home_directory.make_dir(screenshot_directory_path);
	# create file to OCRoutput
	if FileAccess.file_exists(ocrOutput_file_path):
		DirAccess.remove_absolute(ocrOutput_file_path);
		FileAccess.open(ocrOutput_file_path, FileAccess.WRITE);
	else:
		FileAccess.open(ocrOutput_file_path, FileAccess.WRITE);
	
	var pid:int = OS.create_process("manga_ocr", []);

	var ocroutput: Array = [];

	#quit_program()

# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta: float) -> void:
#	pass
