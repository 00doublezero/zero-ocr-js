use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Stdio;
use tokio::io::AsyncReadExt;
use tokio::process::Command;
// use warp::sse::Event;
// use warp::Filter;
// use futures_util::{Stream, StreamExt};
// use std::convert::Infallible;
// use futures_util::stream::iter;
// use tokio_util::StreamExt;
//use tokio_util::Stream;

#[tokio::main]
async fn main() {
    let home: String = env::var("HOME").unwrap();
    let project_dir_name: String = String::from(".zero_ocr");
    let project_dir_path: String = format!("{}{}{}", &home, "/", &project_dir_name);
    fs::create_dir_all(&project_dir_path).unwrap();

    let screenshot_dir_name: String = String::from("screenshots");
    let screenshot_dir_path: String =
        format!("{}{}{}", &project_dir_path, "/", &screenshot_dir_name);
    fs::create_dir_all(&screenshot_dir_path).unwrap();

    let screenshots_dir_is_empty = PathBuf::from(&screenshot_dir_path)
        .read_dir()
        .unwrap()
        .next()
        .is_none();
    if !screenshots_dir_is_empty {
        fs::remove_dir_all(&screenshot_dir_path).unwrap();
        fs::create_dir_all(&screenshot_dir_path).unwrap();
    }

    let ocr_output_file_name: String = String::from("ocrOutput.txt");
    let ocr_output_path: String = format!("{}{}{}", &project_dir_path, "/", &ocr_output_file_name);
    if PathBuf::from(&ocr_output_path).exists() {
        fs::remove_file(&ocr_output_path).unwrap();
        fs::File::create(&ocr_output_path).unwrap();
    } else {
        fs::File::create(&ocr_output_path).unwrap();
    }

    let mut ocrProcess = Command::new("manga_ocr")
        .args([
            "-r",
            &screenshot_dir_path,
            "-w",
            &ocr_output_path,
            "--delay_secs=5",
        ])
        .stdout(Stdio::piped())
        .spawn()
        .expect("fail proccess manga_ocr");
    let mut tailFprocess = Command::new("tail")
        .args(["-f", &ocr_output_path])
        .stdout(Stdio::piped())
        .spawn()
        .expect("fail proccess tail");
    let mut tail = tailFprocess.stdout.unwrap();

    // let ocr_recv = warp::path("ocr").and(warp::get()).map(|| {
    //     // reply using server-sent events
    //     //let stream = user_connected(users);
    //     warp::sse::reply(event_stream);
    // });

    // let index = warp::path::end().map(|| {
    //     warp::http::Response::builder()
    //         .header("content-type", "text/html; charset=utf-8")
    //         .body(INDEX_HTML)
    // });

    // let routes = index.or(ocr_recv);
    // warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;


    loop {
        let mut buf = vec![0; 1024];

        match tail.read(&mut buf).await {
            Ok(n) => {
                if n == 0 {
                    break;
                }
                println!("{}", String::from_utf8_lossy(&buf[..n]));
            }
            Err(e) => {
                println!("Error reading: {}", e);
                break;
            }
        }
    }

}

// fn event_stream() -> impl Stream<Item = Result<Event, Infallible>> {
//     iter(vec![
//         // Unnamed event with data only
//         Ok(Event::default().data("payload")),
//         // Named event with ID and retry timeout
//     ])
// }


static INDEX_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Zero-ocr</title>
    </head>
    <body>
        <div id="ocrOutput">
        </div>
    <script  type="text/javascript">
        var uri = 'http://' + location.host + '/ocr';
        var sse = new EventSource(uri);
        sse.onmessage = function(msg) {
            console.log(msg.data);
        };
    </script>
    </body>
    </html>
    "#;
