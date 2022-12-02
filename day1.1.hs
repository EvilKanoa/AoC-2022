main :: IO ()
main = do
        contents <- readFile "day1.1.txt"
        putStrLn (concat (splitStr "\n\n" contents))
